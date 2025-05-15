import { Link } from 'react-router-dom';

import {
  IconCirclePlusFilled,
  IconTrashFilled,
  type Icon,
} from '@tabler/icons-react';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

// ALERT DIALOG
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
} from '@/components/ui/alert-dialog';

export function NavMain({
  items,
  onClick,
}: {
  items: {
    id: string;
    date: string;
    title: string;
    icon?: Icon;
  }[];
  onClick: (id: string) => void;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-5">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              asChild
              tooltip="New chat"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <Link to="/chat">
                <IconCirclePlusFilled className="!size-5" />
                <span className="text-base">New chat</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <div key={item.id}>
              <div className="text-muted-foreground uppercase">{item.date}</div>

              <SidebarMenuItem key={item.title} className="relative">
                <SidebarMenuButton asChild tooltip={item.title}>
                  <Link to={`/chat/${item.id}`}>
                    {item.icon && <item.icon className="!size-5" />}
                    <span className="text-base">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <IconTrashFilled className="!size-5 absolute top-1.5 right-0.5 cursor-pointer" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your chat.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onClick(item.id)}>
                        Continue
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
