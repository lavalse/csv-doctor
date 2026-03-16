type Props = {
  message: string;
};

export function ErrorNotice({ message }: Props) {
  return (
    <div className="error-notice" role="alert">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
        <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
      </svg>
      <span>{message}</span>
    </div>
  );
}
