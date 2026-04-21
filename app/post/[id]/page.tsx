import { Metadata } from 'next'
import styles from './styles.module.css'
import RoomClient from './RoomClient'

interface PageProps {
  params: Promise<{ id: string }>
}

const API = process.env.API_URL;

async function getRoomData(id: string) {
  try {
    // API is fully configured on server
    const res = await fetch(`${API}/rooms/${id}/share-info`, { cache: 'no-store' });
    console.log(res)
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getRoomData(id);

  if (!data) return { title: 'Không tìm thấy phòng' };

  return {
    title: data.title || 'Chi tiết phòng',
    description: data.description,
    openGraph: {
      title: data.title,
      description: data.description,
      images: data.imageUrl ? [data.imageUrl] : [],
      type: 'website',
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = await getRoomData(id);

  if (!data) {
    return <div className={styles.errorContainer}>Không tìm thấy thông tin phòng</div>;
  }

  return <RoomClient data={data} id={id} />;
}
