import type { CleaningOption } from "../types/csv";

type Props = {
  options: CleaningOption;
  onChange: (opts: CleaningOption) => void;
};

const OPTION_CONFIG: { key: keyof CleaningOption; label: string; description: string }[] = [
  {
    key: "normalizeNFKC",
    label: "Unicode NFKC正規化",
    description: "全角英数字・記号を半角に変換します（例: Ａ→A, １→1）",
  },
  {
    key: "removeInvisibleChars",
    label: "不可視文字を除去",
    description: "ゼロ幅スペース・制御文字などを取り除きます",
  },
  {
    key: "trimHeaders",
    label: "ヘッダーの前後スペースを除去",
    description: "列名の先頭・末尾にある空白文字を削除します",
  },
  {
    key: "trimCells",
    label: "セルの前後スペースを除去",
    description: "各セル値の先頭・末尾にある空白文字を削除します",
  },
  {
    key: "normalizeMultilineCells",
    label: "セル内改行を正規化",
    description: "セル内の改行（Alt+Enterなど）をスペースに置き換え、1レコード1行に統一します",
  },
  {
    key: "removeEmptyRows",
    label: "空行を削除",
    description: "すべてのセルが空白の行（末尾の空行など）を取り除きます",
  },
  {
    key: "forceCommaDelimiter",
    label: "区切り文字をカンマに統一",
    description: "出力ファイルの区切り文字を強制的にカンマ(,)にします",
  },
];

export function OptionsPanel({ options, onChange }: Props) {
  const toggle = (key: keyof CleaningOption) => {
    onChange({ ...options, [key]: !options[key] });
  };

  return (
    <div className="card">
      <h2 className="card-title">クリーニング設定</h2>
      <div className="options-list">
        {OPTION_CONFIG.map(({ key, label, description }) => (
          <label key={key} className="option-item">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() => toggle(key)}
            />
            <span className="option-text">
              <span className="option-label">{label}</span>
              <span className="option-desc">{description}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
