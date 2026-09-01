package com.azets.alm.intake.reader;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Resolves a source file's header row onto the canonical field set. Legacy exports name the same
 * column a dozen ways, so alias matching happens here once rather than in every reader.
 */
public final class HeaderMapper {

    private HeaderMapper() {
    }

    public record Mapping(Integer code, Integer name, Integer type, Integer parent, Integer currency) {

        /** Code and name are the minimum required to produce a mappable account. */
        public boolean hasRequired() {
            return code != null && name != null;
        }
    }

    public static Mapping map(List<String> header) {
        AtomicInteger index = new AtomicInteger();
        Map<String, Integer> normalised = header.stream()
                .collect(Collectors.toMap(
                        h -> normalise(h),
                        h -> index.getAndIncrement(),
                        (a, b) -> a));

        return new Mapping(
                find(normalised, LedgerFileReader.Columns.CODE),
                find(normalised, LedgerFileReader.Columns.NAME),
                find(normalised, LedgerFileReader.Columns.TYPE),
                find(normalised, LedgerFileReader.Columns.PARENT),
                find(normalised, LedgerFileReader.Columns.CURRENCY));
    }

    private static Integer find(Map<String, Integer> header, List<String> aliases) {
        for (String alias : aliases) {
            Integer position = header.get(alias);
            if (position != null) {
                return position;
            }
        }
        return null;
    }

    private static String normalise(String header) {
        return header == null ? "" : header.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    public static String cell(String[] row, Integer index) {
        if (index == null || index >= row.length) {
            return null;
        }
        String value = row[index];
        return value == null || value.isBlank() ? null : value.trim();
    }
}
