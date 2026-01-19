'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const MenuBar = ({ editor }: { editor: any }) => {
  const [_, setTick] = useState(0); // Force re-render

  useEffect(() => {
    if (!editor) return;

    const update = () => setTick(t => t + 1);
    editor.on('transaction', update);
    editor.on('selectionUpdate', update);

    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    }
  }, [editor]);

  if (!editor) {
    return null
  }

  const items = [
    {
      icon: Bold,
      title: 'Bold',
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      icon: Italic,
      title: 'Italic',
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      icon: Strikethrough,
      title: 'Strike',
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive('strike'),
    },
    {
      icon: Code,
      title: 'Code',
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive('code'),
    },
    {
      type: 'divider',
    },
    {
      icon: Heading1,
      title: 'Heading 1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive('heading', { level: 1 }),
    },
    {
      icon: Heading2,
      title: 'Heading 2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      title: 'Heading 3',
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      type: 'divider',
    },
    {
      icon: List,
      title: 'Bullet List',
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      title: 'Ordered List',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
    {
      icon: Quote,
      title: 'Blockquote',
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive('blockquote'),
    },
    {
      type: 'divider',
    },
    {
      icon: Undo,
      title: 'Undo',
      action: () => editor.chain().focus().undo().run(),
    },
    {
      icon: Redo,
      title: 'Redo',
      action: () => editor.chain().focus().redo().run(),
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/20 rounded-t-xl sticky top-0 z-10 backdrop-blur-sm">
      {items.map((item, index) => (
        item.type === 'divider' ? (
          <div key={index} className="w-px h-6 bg-border mx-1" />
        ) : (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              item.action?.();
            }}
            title={item.title}
            className={cn(
              "p-2 rounded-md transition-all hover:bg-primary/10 hover:text-primary",
              item.isActive?.() ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
            )}
            type="button"
          >
            {item.icon && <item.icon className="w-4 h-4" />}
          </button>
        )
      ))}
    </div>
  )
}

const Tiptap = ({ content, onChange }: { content: string, onChange: (content: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none min-h-[200px] p-4 text-foreground marker:text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-foreground',
      },
    },
    immediatelyRender: false
  })

  return (
    <div className="clay-input p-0 flex flex-col overflow-hidden bg-white/50 border border-input focus-within:ring-2 focus-within:ring-primary/20">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

export default Tiptap
