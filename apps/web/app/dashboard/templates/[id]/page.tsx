import { notFound } from 'next/navigation';
import { getTemplate } from '../actions';
import { TemplateEditor } from '../template-editor';

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  return <TemplateEditor template={template} />;
}
