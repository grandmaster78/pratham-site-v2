import NextImage, { ImageProps } from "next/image";

/**
 * Custom Image component with rounded corners and subtle shadows.
 * Use for gallery photos, blog thumbnails, and any imagery.
 * Wraps next/image for optimal loading.
 *
 * Example:
 *   <Image src="/photo.jpg" alt="..." width={400} height={300} />
 */
export function Image({ className = "", ...props }: ImageProps) {
  return (
    <NextImage
      className={`rounded-xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),0_2px_8px_-2px_rgba(0,0,0,0.3)] ${className}`}
      {...props}
    />
  );
}
