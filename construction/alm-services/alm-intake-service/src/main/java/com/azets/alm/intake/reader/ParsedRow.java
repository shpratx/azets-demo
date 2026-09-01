package com.azets.alm.intake.reader;

/** One raw row as read from the source file, before normalisation. */
public record ParsedRow(int rowNumber, String legacyCode, String legacyName, String accountType,
                        String parentCode, String currency) {
}
