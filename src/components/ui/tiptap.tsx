'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] border p-4 rounded-md',
        },
    },
  })

  return (
    <EditorContent editor={editor} />
  )
}

export default Tiptap
