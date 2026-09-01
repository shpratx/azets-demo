package com.azets.alm.intake.reader;

import java.io.InputStream;
import java.util.List;

/**
 * Strategy per source format (LLD 2.1). The per-format reader is what contains XML schema
 * variance and CSV dialect differences to one class each - HLD risk R-5.
 */
public interface LedgerFileReader {

    /** Extension this reader handles, lower case and without the dot. */
    String format();

    /**
     * @throws com.azets.alm.common.error.Exceptions.UnprocessableEntity when the structure cannot
     *                                                                   be read at all, which fails the session.
     */
    ReadResult read(InputStream in);

    /**
     * @param rows            successfully read rows
     * @param missingColumns  required columns absent from the header, reported as Errors
     * @param headerRowNumber the row the header was found on, so issue row numbers match the user's file
     */
    record ReadResult(List<ParsedRow> rows, List<String> missingColumns, int headerRowNumber) {
    }

    /** Column aliases accepted across the legacy systems seen so far. */
    interface Columns {
        List<String> CODE = List.of("code", "accountcode", "account_code", "legacycode",
                "legacy_code", "nominalcode", "nominal", "acct", "account");
        List<String> NAME = List.of("name", "accountname", "account_name", "legacyname",
                "legacy_name", "description", "narrative", "title");
        List<String> TYPE = List.of("type", "accounttype", "account_type", "category", "class",
                "classification");
        List<String> PARENT = List.of("parent", "parentcode", "parent_code", "group", "groupcode");
        List<String> CURRENCY = List.of("currency", "ccy", "currencycode", "currency_code");
    }
}
