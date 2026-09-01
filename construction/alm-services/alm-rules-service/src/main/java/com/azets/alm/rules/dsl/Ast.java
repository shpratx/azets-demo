package com.azets.alm.rules.dsl;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The parsed condition. Parsing happens once at rule save time and the AST is cached, so
 * evaluation of a whole ledger costs no re-parsing (LLD 3.1).
 */
public sealed interface Ast {

    /** Evaluates against one account's addressable fields. A null field never matches. */
    boolean test(Map<String, String> account);

    record And(Ast left, Ast right) implements Ast {
        @Override
        public boolean test(Map<String, String> account) {
            return left.test(account) && right.test(account);
        }
    }

    record Or(Ast left, Ast right) implements Ast {
        @Override
        public boolean test(Map<String, String> account) {
            return left.test(account) || right.test(account);
        }
    }

    record Not(Ast inner) implements Ast {
        @Override
        public boolean test(Map<String, String> account) {
            return !inner.test(account);
        }
    }

    /**
     * A single field comparison. Comparisons are case-insensitive because legacy source data is
     * inconsistently cased and a rule author should not have to think about it - normalisation
     * has already trimmed and case-folded names by the time rules run (F1.2.2).
     */
    record Comparison(String field, String operator, String literal, List<String> list,
                      Pattern compiled) implements Ast {

        @Override
        public boolean test(Map<String, String> account) {
            String value = account.get(field);
            if (value == null) {
                return false;
            }
            String v = value.toLowerCase(Locale.ROOT);
            return switch (operator) {
                case "=" -> v.equals(literal.toLowerCase(Locale.ROOT));
                case "!=" -> !v.equals(literal.toLowerCase(Locale.ROOT));
                case "startsWith" -> v.startsWith(literal.toLowerCase(Locale.ROOT));
                case "endsWith" -> v.endsWith(literal.toLowerCase(Locale.ROOT));
                case "contains" -> v.contains(literal.toLowerCase(Locale.ROOT));
                case "in" -> list.stream().anyMatch(item -> item.equalsIgnoreCase(value));
                case "matches" -> matchesBounded(v);
                default -> throw new DslException("Unsupported operator '" + operator + "'");
            };
        }

        /**
         * Patterns are compiled once and run against a bounded input. A rule author is an
         * administrator, not an attacker, but a catastrophically backtracking pattern applied to
         * every row of a large ledger is a denial of service by accident - so the input is
         * truncated and the matcher is capped (LLD 3.1).
         */
        private boolean matchesBounded(String value) {
            String bounded = value.length() > MAX_MATCH_INPUT ? value.substring(0, MAX_MATCH_INPUT) : value;
            Matcher matcher = compiled.matcher(bounded);
            return matcher.find();
        }
    }

    int MAX_MATCH_INPUT = 512;
}
