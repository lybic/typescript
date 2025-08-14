import { cn } from '@/lib/utils'
interface BlobProps extends React.HTMLAttributes<HTMLDivElement> {
  firstBlobColor: string
  secondBlobColor: string
}

export default function BlurryBlob({ className, firstBlobColor, secondBlobColor }: BlobProps) {
  return (
    <div className="min-h-52 min-w-52 items-center justify-center">
      <div className="relative w-full">
        <div
          className={cn(
            'absolute -right-24 -top-28 size-[min(70cqw,70cqh)] animate-pop-blob rounded-sm bg-blue-400 p-8 opacity-45 blur-3xl filter mix-blend-multiply',
            className,
            firstBlobColor,
          )}
        ></div>
        <div
          className={cn(
            'absolute -left-40 -top-64 size-[min(70cqw,70cqh)] animate-pop-blob-2 rounded-sm bg-purple-400 p-8 opacity-45 blur-3xl filter mix-blend-multiply',
            className,
            secondBlobColor,
          )}
        ></div>
      </div>
    </div>
  )
}
