import { primaryButton } from '../button-styles';
import { getProfile } from './actions';
import { ChangePasswordForm } from './change-password-form';
import { DeleteAccountDialog } from './delete-account-dialog';
import { DisplayNameForm } from './display-name-form';
import { EmailForm } from './email-form';

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col gap-6 p-6">
      <header>
        <h1 className="font-display text-h1 text-text-primary">Profile</h1>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Identity</h2>
        <div className="flex flex-col gap-5 rounded-lg border border-border-default p-5">
          <EmailForm email={profile.email} />
          <DisplayNameForm displayName={profile.displayName} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Password</h2>
        <div className="rounded-lg border border-border-default p-5">
          <ChangePasswordForm />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Multi-factor authentication</h2>
        <div className="flex flex-col gap-4 rounded-lg border border-border-default p-5">
          <p className="text-body text-text-secondary">
            Protect your account with a second factor at sign in.
          </p>
          <div className="flex flex-col gap-[7px]">
            <button type="button" disabled className={`${primaryButton} w-max`}>
              Enable MFA
            </button>
            <span className="text-caption text-text-muted">Not wired up yet.</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-meta font-medium text-text-secondary">Danger zone</h2>
        <div className="flex flex-col gap-4 rounded-lg border border-danger-edge p-5">
          <p className="text-body text-text-secondary">
            Deleting your account removes every domain, API key, template and email it owns. Your
            request logs stay, with the account detached from them. This cannot be undone.
          </p>
          <DeleteAccountDialog email={profile.email} />
        </div>
      </section>
    </div>
  );
}
