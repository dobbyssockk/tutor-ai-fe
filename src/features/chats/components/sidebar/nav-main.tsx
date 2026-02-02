import { IconCirclePlusFilled, type Icon } from '@tabler/icons-react';
import { Trash2 } from 'lucide-react';

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

export function NavMain({
  items,
  onClick,
  onDeleteAll,
}: {
  items: {
    id: string;
    date: string;
    title: string;
    icon?: Icon;
  }[];
  onClick: (id: string) => void;
  onDeleteAll?: () => void;
}) {
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
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Your chats
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className="group">
              <SidebarMenuItem key={item.title} className="relative">
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="pr-12 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/40 data-[active=true]:bg-muted/50"
                >
                  <Link
                    to={`/chat/${item.id}`}
                    className="flex items-start gap-3 min-w-0 py-1"
                  >
                    {item.icon && <item.icon className="!size-5" />}
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">
                        {item.title}
                      </span>
                    </span>
                  </Link>
                </SidebarMenuButton>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100"
                      aria-label="Удалить чат"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить чат?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Чат будет удален навсегда.
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
              </SidebarMenuItem>
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
