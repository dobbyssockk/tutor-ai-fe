import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';

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
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import useAuthStore from '@/features/auth/store';
import { useDeleteMe, useUpdateMe } from '@/features/auth/hooks/useAuth';

const AccountPreviewCard = () => {
  const { user } = useAuthStore();
  const { mutate: updateMe, isPending } = useUpdateMe();
  const { mutate: deleteMe, isPending: isDeleting } = useDeleteMe();
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [instructions, setInstructions] = useState('');
  const createdAtLabel = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : '-';
  const displayNameValue = displayName.trim();
  const displayNameLabel = displayNameValue || user?.username || 'Anonymous';

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setInstructions(user?.tutorInstructions ?? '');
  }, [user?.displayName, user?.tutorInstructions]);

  const isDirty = useMemo(() => {
    const instructionsDirty =
      (user?.tutorInstructions ?? '') !== instructions.trim();
    const displayNameDirty = (user?.displayName ?? '') !== displayName.trim();
    return instructionsDirty || displayNameDirty;
  }, [displayName, instructions, user?.displayName, user?.tutorInstructions]);

  return (
    <section className="rounded-xl border bg-card/60 p-6 shadow-sm">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Account preview
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{displayNameLabel}</span>
              <span className="text-muted-foreground">
                {user?.email ?? '-'}
              </span>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-6 space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Account details
            </p>
            <div className="mt-3 grid gap-3 rounded-lg border bg-background/60 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">
                  Display name
                  <span className="ml-1 text-xs text-muted-foreground">
                    (used in chat)
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Your name"
                      className="h-8 w-40 text-sm"
                      aria-label="Display name"
                    />
                  ) : (
                    <span
                      className={
                        displayNameValue
                          ? 'font-medium'
                          : 'text-muted-foreground'
                      }
                    >
                      {displayNameValue || 'Not set'}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={
                      isEditingName
                        ? 'Hide display name editor'
                        : 'Edit display name'
                    }
                    onClick={() => setIsEditingName((prev) => !prev)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{user?.username ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user?.email ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">{createdAtLabel}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-instructions">
              How should your tutor help?
            </Label>
            <Textarea
              id="profile-instructions"
              placeholder="Explain step-by-step, ask me questions, keep answers short"
              className="text-sm"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              We will use this to guide how your tutor responds to you.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              disabled={!isDirty || isPending}
              onClick={() =>
                updateMe({
                  tutorInstructions: instructions.trim() || null,
                  displayName: displayName.trim() || null,
                })
              }
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </div>

          <div className="rounded-lg border border-destructive/30 bg-background/60 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">
                  Delete account
                </p>
                <p className="text-sm text-muted-foreground">
                  This permanently removes your profile, goals, and chats.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete account'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Your chats, goals, and
                      profile will be permanently removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20"
                      onClick={() => deleteMe()}
                      disabled={isDeleting}
                    >
                      Delete account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
};

export default AccountPreviewCard;
