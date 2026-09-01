package com.azets.alm.intake.reader;

import com.azets.alm.common.error.Exceptions;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** F1.1.1. */
@Component
public class CsvLedgerReader implements LedgerFileReader {

    @Override
    public String format() {
        return "csv";
    }

    @Override
    public ReadResult read(InputStream in) {
        List<ParsedRow> rows = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setIgnoreEmptyLines(true)
                .setTrim(true)
                .get();

        try (CSVParser parser = CSVParser.parse(new InputStreamReader(in, StandardCharsets.UTF_8), format)) {
            List<CSVRecord> records = parser.getRecords();
            if (records.isEmpty()) {
                throw new Exceptions.UnprocessableEntity(
                        "The file contains no rows. An empty upload is rejected rather than "
                                + "accepted as an empty session.");
            }

            CSVRecord headerRecord = records.get(0);
            List<String> header = new ArrayList<>();
            headerRecord.forEach(header::add);
            HeaderMapper.Mapping mapping = HeaderMapper.map(header);

            if (mapping.code() == null) {
                missing.add("account code");
            }
            if (mapping.name() == null) {
                missing.add("account name");
            }
            if (!missing.isEmpty()) {
                return new ReadResult(List.of(), missing, 1);
            }

            for (int i = 1; i < records.size(); i++) {
                CSVRecord record = records.get(i);
                String[] cells = new String[record.size()];
                for (int c = 0; c < record.size(); c++) {
                    cells[c] = record.get(c);
                }
                // Row numbers are the user's file rows, one-based including the header.
                rows.add(new ParsedRow(
                        i + 1,
                        HeaderMapper.cell(cells, mapping.code()),
                        HeaderMapper.cell(cells, mapping.name()),
                        HeaderMapper.cell(cells, mapping.type()),
                        HeaderMapper.cell(cells, mapping.parent()),
                        HeaderMapper.cell(cells, mapping.currency())));
            }
            if (rows.isEmpty()) {
                throw new Exceptions.UnprocessableEntity(
                        "The file contains a header row but no data rows (TS-UPL-06).");
            }
            return new ReadResult(rows, missing, 1);
        } catch (IOException ex) {
            throw new Exceptions.UnprocessableEntity("The CSV file could not be read: " + ex.getMessage());
        }
    }
}
