import Link from 'next/link';

export default function MessageButton({
  targetId,
  className = '',
}: {
  targetId: string;
  className?: string;
}) {
  return (
    <Link href={`/messages/${targetId}`} className={`btn-leather text-center ${className}`}>
      Message
    </Link>
  );
}
