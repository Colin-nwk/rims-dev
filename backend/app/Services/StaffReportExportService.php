<?php

namespace App\Services;

use App\Models\Staff;
use Closure;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StaffReportExportService
{
    /**
     * @param  array<int, string>  $columns
     * @param  array<string, array{label: string, category: string, default: bool}>  $definitions
     * @param  Closure(): iterable<Staff>  $rows
     */
    public function download(
        string $format,
        string $fileName,
        array $columns,
        array $definitions,
        Closure $rows,
        StaffReportColumnRegistry $registry,
    ): StreamedResponse {
        return match ($format) {
            'pdf' => response()->streamDownload(
                fn () => print $this->pdf($fileName, $columns, $definitions, $rows(), $registry),
                "{$fileName}.pdf",
                $this->headers('application/pdf'),
            ),
            'word' => $this->htmlDownload($fileName, 'doc', 'application/msword', $columns, $definitions, $rows, $registry),
            'document' => $this->htmlDownload($fileName, 'html', 'text/html; charset=UTF-8', $columns, $definitions, $rows, $registry),
            default => throw new \InvalidArgumentException("Unsupported export format: {$format}"),
        };
    }

    /**
     * @param  array<int, string>  $columns
     * @param  array<string, array{label: string, category: string, default: bool}>  $definitions
     * @param  Closure(): iterable<Staff>  $rows
     */
    private function htmlDownload(
        string $fileName,
        string $extension,
        string $contentType,
        array $columns,
        array $definitions,
        Closure $rows,
        StaffReportColumnRegistry $registry,
    ): StreamedResponse {
        return response()->streamDownload(function () use ($fileName, $columns, $definitions, $rows, $registry): void {
            echo '<!doctype html><html><head><meta charset="UTF-8"><title>'.e($fileName).'</title>';
            echo '<style>body{font-family:Arial,sans-serif;color:#172033}h1{font-size:22px}p{color:#64748b}table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}th{background:#14532d;color:#fff}</style></head><body>';
            echo '<h1>'.e(str($fileName)->replace('-', ' ')->title()).'</h1><p>Generated '.e(now()->toDayDateTimeString()).'</p><table><thead><tr>';
            foreach ($columns as $column) {
                echo '<th>'.e($definitions[$column]['label']).'</th>';
            }
            echo '</tr></thead><tbody>';
            foreach ($rows() as $staff) {
                echo '<tr>';
                foreach ($columns as $column) {
                    echo '<td>'.e((string) ($registry->value($staff, $column) ?? '')).'</td>';
                }
                echo '</tr>';
            }
            echo '</tbody></table></body></html>';
        }, "{$fileName}.{$extension}", $this->headers($contentType));
    }

    /**
     * @param  array<int, string>  $columns
     * @param  array<string, array{label: string, category: string, default: bool}>  $definitions
     * @param  iterable<Staff>  $rows
     */
    private function pdf(
        string $fileName,
        array $columns,
        array $definitions,
        iterable $rows,
        StaffReportColumnRegistry $registry,
    ): string {
        $pageWidth = 842;
        $pageHeight = 595;
        $margin = 28;
        $columnWidth = ($pageWidth - ($margin * 2)) / count($columns);
        $charactersPerColumn = max(5, (int) floor($columnWidth / 4.2));
        $pages = [];
        $currentPage = [];

        foreach ($rows as $staff) {
            $currentPage[] = array_map(
                fn (string $column): string => str((string) ($registry->value($staff, $column) ?? ''))->limit($charactersPerColumn, '')->toString(),
                $columns,
            );
            if (count($currentPage) === 37) {
                $pages[] = $currentPage;
                $currentPage = [];
            }
        }
        if ($currentPage !== [] || $pages === []) {
            $pages[] = $currentPage;
        }

        $objects = [
            1 => '<< /Type /Catalog /Pages 2 0 R >>',
            2 => '',
            3 => '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];
        $pageIds = [];

        foreach ($pages as $pageIndex => $pageRows) {
            $pageId = count($objects) + 1;
            $contentId = $pageId + 1;
            $pageIds[] = "{$pageId} 0 R";
            $content = $this->pdfText($fileName, $margin, $pageHeight - 28, 12);
            $content .= $this->pdfText('Generated '.now()->toDayDateTimeString().'  |  Page '.($pageIndex + 1).' of '.count($pages), $margin, $pageHeight - 43, 7);

            foreach ($columns as $index => $column) {
                $content .= $this->pdfText(
                    str($definitions[$column]['label'])->limit($charactersPerColumn, '')->toString(),
                    $margin + ($index * $columnWidth),
                    $pageHeight - 62,
                    7,
                );
            }

            foreach ($pageRows as $rowIndex => $row) {
                $y = $pageHeight - 78 - ($rowIndex * 13);
                foreach ($row as $columnIndex => $value) {
                    $content .= $this->pdfText($value, $margin + ($columnIndex * $columnWidth), $y, 6);
                }
            }

            $objects[$pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {$pageWidth} {$pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents {$contentId} 0 R >>";
            $objects[$contentId] = '<< /Length '.strlen($content).">>\nstream\n{$content}endstream";
        }

        $objects[2] = '<< /Type /Pages /Kids ['.implode(' ', $pageIds).'] /Count '.count($pageIds).' >>';

        return $this->assemblePdf($objects);
    }

    private function pdfText(string $value, float $x, float $y, int $size): string
    {
        $encoded = iconv('UTF-8', 'Windows-1252//TRANSLIT//IGNORE', $value) ?: '';
        $escaped = str_replace(['\\', '(', ')', "\r", "\n"], ['\\\\', '\\(', '\\)', ' ', ' '], $encoded);

        return sprintf("BT /F1 %d Tf 1 0 0 1 %.2f %.2f Tm (%s) Tj ET\n", $size, $x, $y, $escaped);
    }

    /** @param array<int, string> $objects */
    private function assemblePdf(array $objects): string
    {
        ksort($objects);
        $pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
        $offsets = [0 => 0];

        foreach ($objects as $id => $object) {
            $offsets[$id] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$object}\nendobj\n";
        }

        $xrefOffset = strlen($pdf);
        $pdf .= 'xref'."\n0 ".(count($objects) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";
        foreach (array_keys($objects) as $id) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$id]);
        }
        $pdf .= 'trailer'."\n<< /Size ".(count($objects) + 1).' /Root 1 0 R >>'."\nstartxref\n{$xrefOffset}\n%%EOF";

        return $pdf;
    }

    /** @return array<string, string> */
    private function headers(string $contentType): array
    {
        return [
            'Content-Type' => $contentType,
            'Cache-Control' => 'no-store, private',
            'X-Content-Type-Options' => 'nosniff',
        ];
    }
}
