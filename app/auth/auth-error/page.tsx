export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-400">Email Confirmation Error</h1>
        <p className="text-brand-cool-gray mb-6">
          There was an error confirming your email. The link may have expired or already been used.
        </p>
        <a href="/auth/login" className="btn-primary inline-block">
          Back to Login
        </a>
      </div>
    </div>
  );
}
