"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { saveProfile, saveAnalyticsSettings } from "@/app/actions";
import type { AnalyticsSettings, UserProfile } from "@/lib/records";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BTN_OUTLINED_GREY, BTN_PRIMARY } from "@/components/form/Dialog";
import { FieldLabel, FormBox, SelectField, TextField } from "@/components/form/FormPrimitives";

const TABS = [
  { id: "", label: "Profile Settings", href: "/user-profile" },
  { id: "analytics", label: "User Analytics Settings", href: "/user-profile?tab=analytics" },
  { id: "password", label: "Change Password", href: "/user-profile?tab=password" },
] as const;

const TIMEZONE_TOOLTIP =
  "Sets the default time zone for all data across your account. Can be overridden in Analytics and when creating Budgets.";

/**
 * `epom-checkbox-button` — a bordered 36px pill wrapping a Material checkbox.
 * Checking it tints the whole pill, not just the box.
 */
function CheckboxButton({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex h-9 w-full cursor-pointer items-center rounded border px-3",
        checked ? "border-epom-primary bg-epom-primary-8" : "border-epom-border",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors duration-[90ms] ease-[cubic-bezier(0,0,.2,.1)]",
          checked ? "border-epom-primary bg-epom-primary" : "border-epom-muted",
        )}
      >
        {checked && <MaterialIcon name="check" className="block text-[14px] leading-[14px] text-white" />}
      </span>
      <span className="text-[14px] leading-[21px] text-epom-text">{label}</span>
    </label>
  );
}

/** `.profile-block` — fields never grow past 720px however wide the column gets. */
function Block({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex max-w-[720px] flex-col", className)}>{children}</div>;
}

function ProfileSettings({
  form,
  onChange,
}: {
  form: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}) {
  return (
    <>
      <FormBox>
        <Block>
          {/* .label-with-tooltip — the info glyph is pushed to the far edge of the row. */}
          <div className="mb-1 flex items-end justify-between">
            <span className="text-[12px] font-semibold leading-[18px] text-epom-muted">
              Account Time zone
              <span className="ml-1 text-epom-primary">*</span>
            </span>
            <span title={TIMEZONE_TOOLTIP} className="flex cursor-pointer rounded-full p-0.5">
              <MaterialIcon name="info" className="block text-[16px] leading-4 text-epom-muted" />
            </span>
          </div>
          <SelectField value={form.timezone} />
        </Block>
      </FormBox>

      {/* Every row carries a 16px bottom margin, the last one included. */}
      <FormBox className="mt-4 gap-4 pb-10">
        <Block className="flex-row gap-4">
          <div className="flex-1">
            <FieldLabel required>First Name</FieldLabel>
            <TextField
              placeholder="First Name"
              value={form.firstName}
              onChange={(v) => onChange({ firstName: v })}
            />
          </div>
          <div className="flex-1">
            <FieldLabel required>Last Name</FieldLabel>
            <TextField
              placeholder="Last Name"
              value={form.lastName}
              onChange={(v) => onChange({ lastName: v })}
            />
          </div>
        </Block>

        <Block>
          <FieldLabel>Email</FieldLabel>
          <TextField placeholder="Enter email" value={form.email} readOnly />
        </Block>

        <Block>
          <FieldLabel required>Company name</FieldLabel>
          <TextField
            placeholder="Company"
            value={form.company}
            onChange={(v) => onChange({ company: v })}
          />
        </Block>

        <Block>
          <FieldLabel required>Country</FieldLabel>
          <SelectField
            value={form.country}
            disabled
            leading={
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/flag-vn.svg"
                alt=""
                className="mr-[10px] h-3 w-4 shrink-0 object-contain"
              />
            }
          />
        </Block>

        <Block>
          <FieldLabel>Phone</FieldLabel>
          <TextField
            placeholder="Phone"
            value={form.phone}
            onChange={(v) => onChange({ phone: v })}
          />
        </Block>
      </FormBox>
    </>
  );
}

function AnalyticsSettingsPanel({
  form,
  onChange,
}: {
  form: AnalyticsSettings;
  onChange: (next: AnalyticsSettings) => void;
}) {
  const update = (index: number, patch: { title?: string; multi?: boolean }) => {
    const next = { actions: [...form.actions] as AnalyticsSettings["actions"] };
    next.actions[index] = { ...next.actions[index], ...patch };
    onChange(next);
  };

  return (
    <FormBox className="gap-4">
      {([0, 1, 2] as const).map((i) => (
        <div key={i} className="flex gap-4">
          <div className="w-[272px]">
            <FieldLabel required>{`Action ${i} Title`}</FieldLabel>
            <TextField
              value={form.actions[i].title}
              onChange={(v) => update(i, { title: v })}
            />
          </div>
          {/* The pill aligns with the input, so it clears the label height. */}
          <div className="w-[272px] pt-[21px]">
            <CheckboxButton
              label="Allow multiple events"
              checked={form.actions[i].multi}
              onChange={(v) => update(i, { multi: v })}
            />
          </div>
        </div>
      ))}
    </FormBox>
  );
}

function ChangePasswordPanel({
  onSave,
}: {
  onSave: (status: string) => void;
}) {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");

  const valid = current.length > 0 && newPw.length >= 8 && newPw === confirm;

  return (
    <>
      <FormBox>
        <Block className="gap-4">
          <div>
            <FieldLabel>Current Password</FieldLabel>
            <TextField
              type="password"
              placeholder="Current Password"
              value={current}
              onChange={setCurrent}
            />
          </div>
          <div>
            <FieldLabel>New Password</FieldLabel>
            <TextField
              type="password"
              placeholder="New Password"
              value={newPw}
              onChange={setNewPw}
            />
            {newPw.length > 0 && newPw.length < 8 && (
              <span className="mt-1 text-[12px] leading-[18px] text-[#ba1a1a]">
                Must be at least 8 characters
              </span>
            )}
          </div>
          <div>
            <FieldLabel>Confirm New Password</FieldLabel>
            <TextField
              type="password"
              placeholder="Confirm New Password"
              value={confirm}
              onChange={setConfirm}
            />
            {confirm.length > 0 && newPw !== confirm && (
              <span className="mt-1 text-[12px] leading-[18px] text-[#ba1a1a]">
                Passwords do not match
              </span>
            )}
          </div>
        </Block>
      </FormBox>

      {/* The password tab has its own inline Save since UserProfileView's
          footer Save is shared by the other two tabs. */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          disabled={!valid}
          onClick={() => {
            setCurrent("");
            setNewPw("");
            setConfirm("");
            onSave("Password changed.");
          }}
          className={cn(
            BTN_PRIMARY,
            "disabled:cursor-not-allowed disabled:bg-black/[0.12] disabled:text-black/30 disabled:shadow-none disabled:hover:bg-black/[0.12]",
          )}
        >
          Save
        </button>
      </div>
    </>
  );
}

export function UserProfileView({
  profile,
  analyticsSettings,
}: {
  profile: UserProfile;
  analyticsSettings: AnalyticsSettings;
}) {
  const activeTab = useSearchParams().get("tab") ?? "";
  const [form, setForm] = useState(profile);
  const [analyticsForm, setAnalyticsForm] = useState(analyticsSettings);
  const [saving, startSaving] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const profileDirty = JSON.stringify(form) !== JSON.stringify(profile);
  const analyticsDirty = JSON.stringify(analyticsForm) !== JSON.stringify(analyticsSettings);
  const dirty = activeTab === "" ? profileDirty : activeTab === "analytics" ? analyticsDirty : false;

  const onSave = () =>
    startSaving(async () => {
      try {
        if (activeTab === "") {
          const saved = await saveProfile(form);
          setForm(saved);
          setStatus("Profile saved.");
        } else if (activeTab === "analytics") {
          const saved = await saveAnalyticsSettings(analyticsForm);
          setAnalyticsForm(saved);
          setStatus("Analytics settings saved.");
        }
      } catch (e) {
        setStatus(e instanceof Error ? e.message : "Could not save.");
      }
    });

  const onCancel = () => {
    if (activeTab === "") {
      setForm(profile);
    } else if (activeTab === "analytics") {
      setAnalyticsForm(analyticsSettings);
    }
    setStatus(null);
  };

  return (
    <AppShell breadcrumbs={[{ label: "User Profile" }]} activeHref="/user-profile">
      <div className="flex h-9 items-center">
        <h1 className="flex items-center whitespace-nowrap text-[20px] font-bold leading-6 text-epom-text">
          User Profile
          <a
            href="https://help.dsp.epom.com/docs/settings"
            target="_blank"
            rel="noreferrer"
            aria-label="User Profile help"
            className="ml-2 flex h-5 w-5 text-epom-link transition-colors duration-[120ms] ease-linear hover:text-epom-primary"
          >
            <MaterialIcon name="help_outline" className="block text-[20px] leading-5" />
          </a>
        </h1>
      </div>

      {/* .page-actions — 16px below the title, 1px rule the tabs sit on. */}
      <nav className="mt-4">
        <ul className="flex h-[34px] border-b border-epom-border">
          {TABS.map((tab, i) => (
            <li key={tab.label} className="relative -mb-px flex h-[34px]">
              <Link
                href={tab.href}
                className={cn(
                  "flex h-[34px] items-center border-b-2 pb-2 pt-1 text-[16px] font-semibold leading-[21px] transition-colors duration-[120ms] ease-linear",
                  i > 0 && "ml-8",
                  activeTab === tab.id
                    ? "border-epom-primary text-epom-primary"
                    : "border-transparent text-epom-muted hover:text-epom-primary-hover",
                )}
              >
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4">
        {activeTab === "analytics" && (
          <AnalyticsSettingsPanel form={analyticsForm} onChange={setAnalyticsForm} />
        )}
        {activeTab === "password" && (
          <ChangePasswordPanel onSave={setStatus} />
        )}
        {activeTab !== "analytics" && activeTab !== "password" && (
          <ProfileSettings
            form={form}
            onChange={(patch) => {
              setForm((f) => ({ ...f, ...patch }));
              setStatus(null);
            }}
          />
        )}
      </div>

      {/* Hide the shared footer on the password tab — it has its own Save. */}
      {activeTab !== "password" && (
        <div className="mt-4 flex items-center justify-end gap-4">
          {status && <span className="text-[12px] leading-[18px] text-epom-muted">{status}</span>}
          <button
            type="button"
            onClick={onCancel}
            className={BTN_OUTLINED_GREY}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className={cn(
              BTN_PRIMARY,
              "disabled:cursor-not-allowed disabled:bg-black/[0.12] disabled:text-black/30 disabled:shadow-none disabled:hover:bg-black/[0.12]",
            )}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </AppShell>
  );
}
