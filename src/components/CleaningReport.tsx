import type { CleaningAction, ValidationWarning } from "../types/csv";

type Props = {
  actions: CleaningAction[];
  warnings: ValidationWarning[];
};

function actionMessage(action: CleaningAction): string {
  switch (action.type) {
    case "removed_bom":
      return "UTF-8 BOM（バイトオーダーマーク）を除去しました";
    case "normalized_line_breaks":
      return "改行コードを LF に統一しました（CR+LF / CR → LF）";
    case "normalized_unicode_nfkc":
      return "Unicode NFKC 正規化を適用しました（全角→半角など）";
    case "removed_invisible_chars":
      return `不可視文字を ${action.count} 件除去しました`;
    case "renamed_duplicate_headers":
      return `重複した列名 ${action.count} 件を連番付きにリネームしました`;
    case "filled_empty_headers":
      return `空の列名 ${action.count} 件を "Column_N" で補完しました`;
    case "normalized_multiline_cells":
      return `セル内改行 ${action.count} 件をスペースに置き換えました`;
    case "removed_empty_rows":
      return `空行 ${action.count} 件を削除しました`;
  }
}

function warningMessage(warning: ValidationWarning): string {
  switch (warning.type) {
    case "inconsistent_column_count":
      return `行 ${warning.row}: 列数が不一致（期待 ${warning.expected}、実際 ${warning.actual}）`;
    case "empty_header":
      return `列 ${warning.column} のヘッダーが空です`;
    case "duplicate_header":
      return `列名 "${warning.name}" が重複しています`;
    case "parse_error":
      return warning.row !== undefined
        ? `解析エラー（行 ${warning.row}）: ${warning.message}`
        : `解析エラー: ${warning.message}`;
  }
}

export function CleaningReport({ actions, warnings }: Props) {
  return (
    <div className="card">
      <h2 className="card-title">クリーニングレポート</h2>

      <div className="report-section">
        <h3 className="report-section-title report-actions-title">実行した処理</h3>
        {actions.length === 0 ? (
          <p className="report-empty">処理なし</p>
        ) : (
          <ul className="report-list report-list-actions">
            {actions.map((a, i) => (
              <li key={i}>{actionMessage(a)}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="report-section">
        <h3 className="report-section-title report-warnings-title">警告</h3>
        {warnings.length === 0 ? (
          <p className="report-empty">問題は見つかりませんでした</p>
        ) : (
          <ul className="report-list report-list-warnings">
            {warnings.map((w, i) => (
              <li key={i}>{warningMessage(w)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
