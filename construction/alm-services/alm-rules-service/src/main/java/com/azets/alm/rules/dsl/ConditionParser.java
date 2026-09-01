package com.azets.alm.rules.dsl;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

/**
 * Recursive-descent parser for the LLD 3.1 grammar:
 * <pre>
 *   condition := expr (('AND' | 'OR') expr)*
 *   expr      := field op literal | '(' condition ')' | 'NOT' expr
 *   op        := '=' | '!=' | 'startsWith' | 'endsWith' | 'contains' | 'matches' | 'in'
 *   literal   := quoted-string | number | '[' quoted-string (',' quoted-string)* ']'
 * </pre>
 * AND binds tighter than OR, which is the reading most rule authors assume; making it explicit
 * here avoids a class of silently wrong rules.
 */
public final class ConditionParser {

    private final List<Token> tokens;
    private int index;

    private ConditionParser(List<Token> tokens) {
        this.tokens = tokens;
    }

    public static Ast parse(String condition) {
        if (condition == null || condition.isBlank()) {
            throw new DslException("Condition must not be empty");
        }
        ConditionParser parser = new ConditionParser(new Lexer(condition).tokenise());
        Ast ast = parser.parseOr();
        parser.expect(Token.Kind.EOF, "end of condition");
        return ast;
    }

    /** Validates without retaining the AST - used by the API to reject a bad rule at save time. */
    public static void validate(String condition) {
        parse(condition);
    }

    private Ast parseOr() {
        Ast left = parseAnd();
        while (peek().kind() == Token.Kind.OR) {
            next();
            left = new Ast.Or(left, parseAnd());
        }
        return left;
    }

    private Ast parseAnd() {
        Ast left = parseUnary();
        while (peek().kind() == Token.Kind.AND) {
            next();
            left = new Ast.And(left, parseUnary());
        }
        return left;
    }

    private Ast parseUnary() {
        if (peek().kind() == Token.Kind.NOT) {
            next();
            return new Ast.Not(parseUnary());
        }
        if (peek().kind() == Token.Kind.LPAREN) {
            next();
            Ast inner = parseOr();
            expect(Token.Kind.RPAREN, "')'");
            return inner;
        }
        return parseComparison();
    }

    private Ast parseComparison() {
        Token field = expect(Token.Kind.FIELD, "a field name");
        Token operator = expect(Token.Kind.OPERATOR, "an operator");

        if ("in".equalsIgnoreCase(operator.text())) {
            expect(Token.Kind.LBRACKET, "'['");
            List<String> items = new ArrayList<>();
            while (peek().kind() != Token.Kind.RBRACKET) {
                items.add(expect(Token.Kind.STRING, "a quoted string").text());
                if (peek().kind() == Token.Kind.COMMA) {
                    next();
                }
            }
            expect(Token.Kind.RBRACKET, "']'");
            if (items.isEmpty()) {
                throw new DslException("'in' requires at least one value", operator.position());
            }
            return new Ast.Comparison(field.text(), "in", null, List.copyOf(items), null);
        }

        Token literal = peek();
        if (literal.kind() != Token.Kind.STRING && literal.kind() != Token.Kind.NUMBER) {
            throw new DslException("Expected a literal after '" + operator.text() + "'", literal.position());
        }
        next();

        Pattern compiled = null;
        if ("matches".equalsIgnoreCase(operator.text())) {
            try {
                compiled = Pattern.compile(literal.text(), Pattern.CASE_INSENSITIVE);
            } catch (PatternSyntaxException ex) {
                throw new DslException("Invalid pattern: " + ex.getDescription(), literal.position());
            }
        }
        return new Ast.Comparison(field.text(), operator.text(), literal.text(), List.of(), compiled);
    }

    private Token peek() {
        return tokens.get(index);
    }

    private void next() {
        if (index < tokens.size() - 1) {
            index++;
        }
    }

    private Token expect(Token.Kind kind, String description) {
        Token token = peek();
        if (token.kind() != kind) {
            throw new DslException("Expected " + description + " but found '"
                    + (token.kind() == Token.Kind.EOF ? "end of condition" : token.text()) + "'",
                    token.position());
        }
        next();
        return token;
    }
}
