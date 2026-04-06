import { useState } from 'react';
import { IconCirclePlusFilled, type Icon } from '@tabler/icons-react';
import { Check, Pencil, Trash2, X } from 'lucide-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';

import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

export function NavMain({
  items,
  onClick,
  onRename,
  onDeleteAll,
}: {
  items: {
    id: string;
    date: string;
    title: string;
    icon?: Icon;
  }[];
  onClick: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDeleteAll?: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const startEditing = (id: string, title: string) => {
    setEditingId(id);
    setDraftTitle(title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftTitle('');
  };

  const submitEditing = (id: string) => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) return;
    onRename(id, nextTitle);
    cancelEditing();
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-5">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip="Новый чат"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <Link to="/chat">
                <IconCirclePlusFilled className="!size-5" />
                <span className="text-base">Новый чат</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {onDeleteAll ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <SidebarMenuButton className="text-rose-400 hover:text-rose-300">
                    <Trash2 className="!size-4" />
                    <span className="text-base">Удалить все чаты</span>
                  </SidebarMenuButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить все чаты?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Все чаты будут удалены
                      навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteAll}>
                      Удалить все
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : null}
        <SidebarMenu>
          {items.length > 0 && (
            <div className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Чаты
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="group/chat">
              {(() => {
                const isEditing = editingId === item.id;
                return (
              <SidebarMenuItem key={item.id} className="relative">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={`rounded-lg border border-transparent transition-[padding] duration-150 hover:border-border/60 hover:bg-muted/40 data-[active=true]:bg-muted/50 ${
                    isEditing ? 'pr-20' : 'pr-3 md:group-hover/chat:pr-20'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 min-w-0 py-1">
                      {item.icon && <item.icon className="!size-5" />}
                      <Input
                        autoFocus
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            submitEditing(item.id);
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            cancelEditing();
                          }
                        }}
                        className="h-8"
                        maxLength={120}
                      />
                    </div>
                  ) : (
                    <Link
                      to={`/chat/${item.id}`}
                      className="flex items-center gap-3 min-w-0 py-1"
                    >
                      {item.icon && <item.icon className="!size-5" />}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium truncate">
                          {item.title}
                        </span>
                      </span>
                    </Link>
                  )}
                </SidebarMenuButton>
                {isEditing ? (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => submitEditing(item.id)}
                      aria-label="Сохранить название"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={cancelEditing}
                      aria-label="Отмена"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-100 transition md:opacity-0 md:group-hover/chat:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => startEditing(item.id, item.title)}
                      aria-label="Переименовать чат"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Удалить чат"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить чат?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Это действие нельзя отменить. Чат будет удален
                            навсегда.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onClick(item.id)}>
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </SidebarMenuItem>
                );
              })()}
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
