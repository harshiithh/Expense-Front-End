export default function LoadingSpinner({ size = 'md' }) {
  const sz = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'
  return (
    <div className="flex items-center justify-center py-8">
      <div className={`${sz} border-2 border-accent/20 border-t-accent rounded-full animate-spin`} />
    </div>
  )
}
