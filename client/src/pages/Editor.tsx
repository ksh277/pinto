import { useParams } from "wouter";
import { EditorLayout } from "@/components/editor/EditorLayout";

export default function Editor() {
  const params = useParams();
  
  return (
    <EditorLayout productType={params.type} />
  );
}