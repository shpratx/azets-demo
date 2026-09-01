package com.azets.alm.rules.dsl;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Tokeniser for the restricted grammar of LLD 3.1. The grammar is deliberately
 * non-Turing-complete - there is no way to express a loop, a function call, or an arbitrary
 * expression, so a rule author cannot achieve code execution (AP-5.1).
 */
final class Lexer {

    static final Set<String> FIELDS = Set.of(
            "legacyCode", "legacyName", "accountType", "parentCode", "currency");

    /** Multi-character operators must be tried before single-character ones. */
    private static final List<String> OPERATORS = List.of(
            "startsWith", "endsWith", "contains", "matches", "in", "!=", "=");

    private final String input;
    private int pos;

    Lexer(String input) {
        this.input = input == null ? "" : input;
    }

    List<Token> tokenise() {
        List<Token> tokens = new ArrayList<>();
        while (true) {
            skipWhitespace();
            if (pos >= input.length()) {
                tokens.add(new Token(Token.Kind.EOF, "", pos));
                return tokens;
            }
            char c = input.charAt(pos);
            int start = pos;

            switch (c) {
                case '(' -> {
                    pos++;
                    tokens.add(new Token(Token.Kind.LPAREN, "(", start));
                    continue;
                }
                case ')' -> {
                    pos++;
                    tokens.add(new Token(Token.Kind.RPAREN, ")", start));
                    continue;
                }
                case '[' -> {
                    pos++;
                    tokens.add(new Token(Token.Kind.LBRACKET, "[", start));
                    continue;
                }
                case ']' -> {
                    pos++;
                    tokens.add(new Token(Token.Kind.RBRACKET, "]", start));
                    continue;
                }
                case ',' -> {
                    pos++;
                    tokens.add(new Token(Token.Kind.COMMA, ",", start));
                    continue;
                }
                case '\'', '"' -> {
                    tokens.add(readString(c));
                    continue;
                }
                default -> {
                    // fall through to keyword, operator, number and field handling
                }
            }

            if (Character.isDigit(c) || (c == '-' && pos + 1 < input.length()
                    && Character.isDigit(input.charAt(pos + 1)))) {
                tokens.add(readNumber());
                continue;
            }

            String operator = matchOperator();
            if (operator != null) {
                tokens.add(new Token(Token.Kind.OPERATOR, operator, start));
                continue;
            }

            String word = readWord();
            if (word.isEmpty()) {
                throw new DslException("Unexpected character '" + c + "'", start);
            }
            String upper = word.toUpperCase(Locale.ROOT);
            switch (upper) {
                case "AND" -> tokens.add(new Token(Token.Kind.AND, word, start));
                case "OR" -> tokens.add(new Token(Token.Kind.OR, word, start));
                case "NOT" -> tokens.add(new Token(Token.Kind.NOT, word, start));
                default -> {
                    if (!FIELDS.contains(word)) {
                        throw new DslException("Unknown field '" + word + "'. Addressable fields are "
                                + String.join(", ", FIELDS.stream().sorted().toList()), start);
                    }
                    tokens.add(new Token(Token.Kind.FIELD, word, start));
                }
            }
        }
    }

    private String matchOperator() {
        for (String op : OPERATORS) {
            if (input.regionMatches(true, pos, op, 0, op.length())) {
                // A word operator must not be a prefix of a longer identifier.
                int after = pos + op.length();
                boolean wordOp = Character.isLetter(op.charAt(0));
                if (wordOp && after < input.length() && Character.isLetterOrDigit(input.charAt(after))) {
                    continue;
                }
                pos = after;
                return op;
            }
        }
        return null;
    }

    private Token readString(char quote) {
        int start = pos;
        pos++;
        StringBuilder sb = new StringBuilder();
        while (pos < input.length() && input.charAt(pos) != quote) {
            if (input.charAt(pos) == '\\' && pos + 1 < input.length()) {
                pos++;
            }
            sb.append(input.charAt(pos));
            pos++;
        }
        if (pos >= input.length()) {
            throw new DslException("Unterminated string literal", start);
        }
        pos++;
        return new Token(Token.Kind.STRING, sb.toString(), start);
    }

    private Token readNumber() {
        int start = pos;
        if (input.charAt(pos) == '-') {
            pos++;
        }
        while (pos < input.length() && (Character.isDigit(input.charAt(pos)) || input.charAt(pos) == '.')) {
            pos++;
        }
        return new Token(Token.Kind.NUMBER, input.substring(start, pos), start);
    }

    private String readWord() {
        int start = pos;
        while (pos < input.length() && (Character.isLetterOrDigit(input.charAt(pos)) || input.charAt(pos) == '_')) {
            pos++;
        }
        return input.substring(start, pos);
    }

    private void skipWhitespace() {
        while (pos < input.length() && Character.isWhitespace(input.charAt(pos))) {
            pos++;
        }
    }
}
