'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DeleteAccountButton({ userId }: { userId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}/delete`, {
        method: 'DELETE',
      });
      if (response.ok) {
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/auth/login');
      } else {
        alert('Gagal menghapus akun');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus akun');
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete Account
    </Button>
  );
}