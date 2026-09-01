package com.azets.alm.rules.dsl;

/** A lexical token of the condition DSL (LLD 3.1). */
record Token(Token.Kind kind, String text, int position) {

    enum Kind {
        FIELD, OPERATOR, STRING, NUMBER, LBRACKET, RBRACKET, COMMA,
        LPAREN, RPAREN, AND, OR, NOT, EOF
    }
}
