const MAX_ROWS = 20;
const MAX_CELL_LEN = 80;

type Props = {
  headers: string[];
  rows: string[][];
};

function truncate(s: string): string {
  return s.length > MAX_CELL_LEN ? s.slice(0, MAX_CELL_LEN) + "…" : s;
}

export function PreviewTable({ headers, rows }: Props) {
  const displayed = rows.slice(0, MAX_ROWS);

  return (
    <div className="card">
      <h2 className="card-title">プレビュー</h2>
      <div className="table-wrapper">
        <table className="preview-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} title={h}>{truncate(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} title={cell}>{truncate(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-footer">
        {rows.length > MAX_ROWS
          ? `先頭 ${MAX_ROWS} 行を表示（全 ${rows.length.toLocaleString()} 行）`
          : `全 ${rows.length.toLocaleString()} 行を表示中`}
      </p>
    </div>
  );
}
