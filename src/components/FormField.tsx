interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

export function FormField({ label, children, required, hint }: FormFieldProps) {
  return (
    <div>
      <label className="glass-label">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-white/50 text-xs mt-1">{hint}</p>}
    </div>
  );
}

interface BarcodeFieldProps {
  value: string;
  onChange: (val: string) => void;
  onLookup: (barcode: string) => void;
  autoFilled?: boolean;
}

export function BarcodeField({ value, onChange, onLookup, autoFilled }: BarcodeFieldProps) {
  return (
    <div>
      <label className="glass-label">
        Barcode <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onBlur={(e) => onLookup(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onLookup(value); }}
          placeholder="Scan / ketik barcode lalu tekan Enter..."
          className="glass-input pr-24"
        />
        {autoFilled && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-600 font-medium bg-emerald-50/80 px-2 py-0.5 rounded-full">
            Auto-filled
          </span>
        )}
      </div>
    </div>
  );
}

interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

export function Alert({ type, message, onClose }: AlertProps) {
  const styles = {
    success: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-800',
    error: 'bg-red-500/20 border-red-400/40 text-red-800',
    info: 'bg-blue-500/20 border-blue-400/40 text-blue-800',
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-sm ${styles[type]} animate-scale-in`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none">&times;</button>
    </div>
  );
}
