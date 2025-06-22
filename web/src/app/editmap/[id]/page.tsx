"use client"
import { div } from 'motion/react-m';
import { useParams } from 'next/navigation';
import MapEditorPage from '../component/MapEditorPage';

export default function PostPage() {
  const params = useParams(); 
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full'>
     <MapEditorPage id={parseInt(id)} />
    </div>
  );
}
