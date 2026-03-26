import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Alert, Box, Button, Chip, CircularProgress, Collapse, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, Divider, IconButton, TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PersonIcon from '@mui/icons-material/Person';
import { resolveMediaUrl, createThumbnail } from '../../utils/media';
import { useOwnProfile, useCreateProfile, useUpdateProfile, useSubmitProfile, useRetractProfile, useUploadAvatar, useDeleteAvatar } from '../../api/hooks/useProfile';
import { useOwnPortfolio, useUploadAsset, useDeleteAsset } from '../../api/hooks/usePortfolio';
import { useTaxonomy } from '../../api/hooks/useTaxonomy';
import FormTextField from '../../components/forms/FormTextField';
import FormSwitch from '../../components/forms/FormSwitch';
import FormFileUpload from '../../components/forms/FormFileUpload';
import FormTagSelect from '../../components/forms/FormTagSelect';
import type { ProfileUpdateRequest } from '../../api/types';
import { colors, fonts } from '../../theme/tokens';

const STATUS_COLORS: Record<string, string> = {
  draft: colors.text.muted,
  submitted: colors.status.info,
  under_review: colors.status.info,
  changes_requested: colors.status.warning,
  approved: colors.status.success,
  rejected: colors.status.error,
};

export default function ProfileEditorPage() {
  const { data: profile, isLoading, error: loadError } = useOwnProfile();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const submitProfile = useSubmitProfile();
  const retractProfile = useRetractProfile();

  const { data: audienceTerms } = useTaxonomy('audience');
  const { data: styleTerms } = useTaxonomy('style');
  const { data: genreTerms } = useTaxonomy('genre');
  const { data: imageTagTerms } = useTaxonomy('image_tag');

  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const { data: portfolioAssets } = useOwnPortfolio();
  const uploadAsset = useUploadAsset();
  const deleteAsset = useDeleteAsset();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [pendingAvatarAssetId, setPendingAvatarAssetId] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [aboutOpen, setAboutOpen] = useState(true);
  const [classOpen, setClassOpen] = useState(true);
  const [selfIdOpen, setSelfIdOpen] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [retractConfirmOpen, setRetractConfirmOpen] = useState(false);
  const [missingFieldsOpen, setMissingFieldsOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [retractError, setRetractError] = useState<string | null>(null);
  const [pendingAsset, setPendingAsset] = useState<string | null>(null);
  const prevAssetsLength = useRef(0);

  // Clear the pending thumbnail once the new asset lands in the list
  useEffect(() => {
    const currentLength = portfolioAssets?.length ?? 0;
    if (pendingAsset !== null && currentLength > prevAssetsLength.current) {
      setPendingAsset(null);
    }
    prevAssetsLength.current = currentLength;
  }, [portfolioAssets, pendingAsset]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    try {
      const thumbnail = await createThumbnail(file);
      setAvatarPreview(thumbnail);
      const result = await uploadAvatar.mutateAsync(file);
      setPendingAvatarAssetId(result.id);
      setAvatarPreview(result.url);
    } catch {
      setAvatarPreview(null);
      setAvatarError('Upload failed. Please try again.');
    }
    e.target.value = '';
  };

  const handleUpload = async (file: File) => {
    const thumbnail = file.type.startsWith('image/') ? await createThumbnail(file) : null;
    setPendingAsset(thumbnail);
    try {
      await uploadAsset.mutateAsync(file);
    } catch (e) {
      setPendingAsset(null);
      throw e;
    }
  };
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);

  const methods = useForm<ProfileUpdateRequest>({ defaultValues: {} });
  const { reset, handleSubmit, watch, setValue } = methods;

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        pronouns: profile.pronouns || '',
        summary: profile.summary || '',
        email: profile.email,
        website_links: profile.website_links || [],
        current_locations: profile.current_locations || [],
        past_locations: profile.past_locations || [],
        has_agent: profile.has_agent,
        agent_details: profile.agent_details || '',
        worked_with_prh: profile.worked_with_prh,
        prh_details: profile.prh_details || '',
        employee_of_prh: profile.employee_of_prh,
        prh_employee_details: profile.prh_employee_details || '',
        audience_tags: profile.audience_tags || [],
        style_tags: profile.style_tags || [],
        genre_tags: profile.genre_tags || [],
        image_tags: profile.image_tags || [],
        uses_ai: profile.uses_ai,
        ai_details: profile.ai_details || '',
        lived_experience_statement: profile.lived_experience_statement || '',
        books_excited_about: profile.books_excited_about || [],
        profile_statement: profile.profile_statement || '',
        is_self_submission: profile.is_self_submission,
        relation_type: profile.relation_type || '',
      });
    }
  }, [profile, reset]);

  const hasAgent = watch('has_agent');
  const workedWithPrh = watch('worked_with_prh');
  const employeeOfPrh = watch('employee_of_prh');
  const usesAi = watch('uses_ai');
  const websiteLinks = watch('website_links') || [];

  // If no profile exists and not loading, show create form
  const isNew = !isLoading && !profile && (loadError as any)?.response?.status === 404;
  const isEditable = !profile || ['draft', 'changes_requested', 'approved'].includes(profile.status);
  const isPending = profile?.status === 'submitted' || profile?.status === 'under_review';

  const onSave = async (data: ProfileUpdateRequest) => {
    setSaveMsg(null);
    setSubmitError(null);
    try {
      if (isNew) {
        await createProfile.mutateAsync({
          name: data.name || 'New Profile',
          email: data.email || '',
        });
        // After creation, update with full data including any pending avatar
        await updateProfile.mutateAsync({ ...data, avatar_asset_id: pendingAvatarAssetId ?? undefined });
        setPendingAvatarAssetId(null);
      } else {
        await updateProfile.mutateAsync(data);
      }
      setSaveMsg('Profile saved');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (e: any) {
      setSubmitError(e?.response?.data?.detail || 'Failed to save');
    }
  };

  const onSubmitForReview = async () => {
    setSubmitError(null);
    setConfirmOpen(false);
    try {
      // Save current form data first, then submit
      const formData = methods.getValues();
      if (isNew) {
        await createProfile.mutateAsync({
          name: formData.name || 'New Profile',
          email: formData.email || '',
        });
        await updateProfile.mutateAsync({ ...formData, avatar_asset_id: pendingAvatarAssetId ?? undefined });
        setPendingAvatarAssetId(null);
      } else {
        await updateProfile.mutateAsync(formData);
      }
      await submitProfile.mutateAsync();
      setSubmitSuccessOpen(true);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (typeof detail === 'object' && detail?.missing_fields) {
        setMissingFields(detail.missing_fields);
        setMissingFieldsOpen(true);
      } else {
        setSubmitError(typeof detail === 'string' ? detail : 'Submission failed');
      }
    }
  };

  const onRetract = async () => {
    setRetractError(null);
    setRetractConfirmOpen(false);
    try {
      await retractProfile.mutateAsync();
    } catch (e: any) {
      setRetractError(e?.response?.data?.detail || 'Failed to cancel submission');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 16 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSave)}>
        {/* Status Bar */}
        {profile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
            <Chip
              label={profile.status.replace(/_/g, ' ').toUpperCase()}
              size="small"
              sx={{
                backgroundColor: STATUS_COLORS[profile.status] || colors.text.muted,
                color: '#fff',
                fontFamily: fonts.utility,
                fontSize: '0.6875rem',
                letterSpacing: '0.05em',
              }}
            />
            {isPending && (
              <Typography variant="body2" sx={{ color: colors.status.info }}>
                Your profile is under review. You cannot edit it until the review is complete.
              </Typography>
            )}
            {profile.status === 'approved' && (
              <Typography variant="body2" sx={{ color: colors.status.success }}>
                Your profile has been approved. You can continue editing it below.
              </Typography>
            )}
            {profile.status === 'changes_requested' && (
              <Typography variant="body2" sx={{ color: colors.status.warning }}>
                Reviewer requested changes. Please update and resubmit.
              </Typography>
            )}
          </Box>
        )}

        <Typography variant="h1" sx={{ mb: 6 }}>
          {isNew ? 'Create Your Profile' : 'Edit Your Profile'}
        </Typography>

        {saveMsg && <Alert severity="success" sx={{ mb: 4 }}>{saveMsg}</Alert>}
        {submitError && <Alert severity="error" sx={{ mb: 4 }}>{submitError}</Alert>}
        {retractError && <Alert severity="error" sx={{ mb: 4 }}>{retractError}</Alert>}

        {/* Section 1: About Me */}
        <SectionHeader title="About Me" open={aboutOpen} onToggle={() => setAboutOpen(!aboutOpen)} />
        <Collapse in={aboutOpen}>
          <Box sx={{ display: 'grid', gap: 5, mb: 6 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `2px solid ${colors.border.default}`,
                  backgroundColor: colors.surface.raised,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {(() => {
                  const src = avatarPreview ?? resolveMediaUrl(profile?.avatar_url);
                  return src ? (
                    <Box
                      component="img"
                      src={src}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <PersonIcon sx={{ fontSize: 48, color: colors.text.muted }} />
                  );
                })()}
                {uploadAvatar.isPending && (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' }}>
                    <CircularProgress size={28} />
                  </Box>
                )}
              </Box>
              {isEditable && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      type="button"
                      size="small"
                      variant="outlined"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadAvatar.isPending || deleteAvatar.isPending}
                    >
                      {profile?.avatar_url ? 'Change photo' : 'Upload photo'}
                    </Button>
                    {profile?.avatar_url && (
                      <Button
                        type="button"
                        size="small"
                        color="error"
                        onClick={() => deleteAvatar.mutate()}
                        disabled={uploadAvatar.isPending || deleteAvatar.isPending}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                  {avatarError && (
                    <Typography variant="body2" sx={{ color: 'error.main' }}>{avatarError}</Typography>
                  )}
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <FormSwitch name="is_self_submission" label="I am submitting for myself" />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
              <FormTextField name="name" label="Full Name" required disabled={!isEditable} />
              <FormTextField name="pronouns" label="Pronouns" disabled={!isEditable} />
            </Box>
            <FormTextField name="email" label="Email" type="email" required disabled={!isEditable} />
            <FormTextField name="summary" label="Short Bio" multiline rows={3} disabled={!isEditable} />

            {/* Website Links */}
            <Box>
              <Typography variant="body2" sx={{ fontFamily: fonts.bodyStrong, mb: 2 }}>
                Website / Social Links
              </Typography>
              {websiteLinks.map((link: any, i: number) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    size="small"
                    label="URL"
                    value={link.url || ''}
                    onChange={(e) => {
                      const updated = [...websiteLinks];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setValue('website_links', updated);
                    }}
                    sx={{ flex: 2 }}
                    disabled={!isEditable}
                  />
                  <TextField
                    size="small"
                    label="Label"
                    value={link.label || ''}
                    onChange={(e) => {
                      const updated = [...websiteLinks];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setValue('website_links', updated);
                    }}
                    sx={{ flex: 1 }}
                    disabled={!isEditable}
                  />
                  <IconButton
                    onClick={() => setValue('website_links', websiteLinks.filter((_: any, j: number) => j !== i))}
                    disabled={!isEditable}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              {isEditable && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setValue('website_links', [...websiteLinks, { url: '', label: '' }])}
                >
                  Add Link
                </Button>
              )}
            </Box>

            <FormTagSelect
              name="current_locations"
              label="Current Location(s)"
              options={[]}
              freeSolo
              required
            />
            <FormTagSelect name="past_locations" label="Past Locations" options={[]} freeSolo />

            <Divider />
            <FormSwitch name="has_agent" label="I have an agent or representative" />
            {hasAgent && (
              <FormTextField name="agent_details" label="Agent Details" multiline rows={2} disabled={!isEditable} />
            )}

            <FormSwitch name="worked_with_prh" label="Previously worked with Penguin Random House" />
            {workedWithPrh && (
              <FormTextField name="prh_details" label="PRH Details (contact, division)" multiline rows={2} disabled={!isEditable} />
            )}

            <FormSwitch name="employee_of_prh" label="Current employee of Penguin Random House" />
            {employeeOfPrh && (
              <FormTextField name="prh_employee_details" label="Division" disabled={!isEditable} />
            )}
          </Box>
        </Collapse>

        {/* Section 2: Artistic Classifications */}
        <SectionHeader title="Artistic Classifications" open={classOpen} onToggle={() => setClassOpen(!classOpen)} />
        <Collapse in={classOpen}>
          <Box sx={{ display: 'grid', gap: 5, mb: 6 }}>
            <FormTagSelect
              name="audience_tags"
              label="Audience"
              options={audienceTerms?.map((t) => t.label) || []}
              required
            />
            <FormTagSelect
              name="style_tags"
              label="Style"
              options={styleTerms?.map((t) => t.label) || []}
              required
            />
            <FormTagSelect
              name="genre_tags"
              label="Genre"
              options={genreTerms?.map((t) => t.label) || []}
            />
            <FormTagSelect
              name="image_tags"
              label="Image Categories / Tags"
              options={imageTagTerms?.map((t) => t.label) || []}
              freeSolo
            />
            {/* Work Samples */}
            <Divider />
            <Box>
              <Typography variant="body2" sx={{ fontFamily: fonts.bodyStrong, mb: 1 }}>
                Work Samples <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.muted, mb: 3 }}>
                Upload at least one sample to submit your profile.
              </Typography>

              {isEditable && (
                <FormFileUpload onUpload={handleUpload} />
              )}

              {((portfolioAssets ?? []).length > 0 || pendingAsset) && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 3,
                    mt: 4,
                  }}
                >
                  {(portfolioAssets ?? []).map((asset) => {
                    const mediaUrl = resolveMediaUrl(asset.media_url);
                    return (
                      <Box
                        key={asset.id}
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: `1px solid ${colors.border.default}`,
                        }}
                      >
                        {mediaUrl ? (
                          <Box
                            component="img"
                            src={mediaUrl}
                            sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <Box sx={{ height: 120, backgroundColor: colors.surface.raised, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <InsertDriveFileIcon sx={{ fontSize: 36, color: colors.text.muted }} />
                          </Box>
                        )}
                        {isEditable && (
                          <IconButton
                            size="small"
                            onClick={() => deleteAsset.mutate(asset.id)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255,255,255,0.85)',
                              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                            }}
                          >
                            <DeleteIcon fontSize="small" sx={{ color: colors.status.error }} />
                          </IconButton>
                        )}
                        {asset.title && (
                          <Typography variant="body2" sx={{ p: 1, fontSize: '0.6875rem', color: colors.text.secondary }}>
                            {asset.title}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                  {pendingAsset !== null && (
                    <Box
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${colors.border.default}`,
                      }}
                    >
                      {pendingAsset ? (
                        <Box
                          component="img"
                          src={pendingAsset}
                          sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <Box sx={{ height: 120, backgroundColor: colors.surface.raised, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <InsertDriveFileIcon sx={{ fontSize: 36, color: colors.text.muted }} />
                        </Box>
                      )}
                      {uploadAsset.isPending && (
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' }}>
                          <CircularProgress size={32} />
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Divider />
            <FormSwitch name="uses_ai" label="I use AI tools in my creative process" />
            {usesAi && (
              <FormTextField name="ai_details" label="Describe your AI usage" multiline rows={3} disabled={!isEditable} />
            )}
          </Box>
        </Collapse>

        {/* Section 3: Self-Identification */}
        <SectionHeader title="Self-Identification" open={selfIdOpen} onToggle={() => setSelfIdOpen(!selfIdOpen)} />
        <Collapse in={selfIdOpen}>
          <Box sx={{ display: 'grid', gap: 5, mb: 6 }}>
            <FormTextField
              name="lived_experience_statement"
              label="How your lived experience informs your art/style"
              multiline
              rows={3}
              disabled={!isEditable}
            />
            <FormTagSelect
              name="books_excited_about"
              label="Types of books you're excited to work on"
              options={[]}
              freeSolo
            />
            <FormTextField
              name="profile_statement"
              label="Artist Profile Statement"
              multiline
              rows={5}
              required
              disabled={!isEditable}
            />
          </Box>
        </Collapse>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 3, mt: 4, mb: 8 }}>
          {isEditable && (
            <>
              <Button
                type="submit"
                variant="contained"
                disabled={updateProfile.isPending || createProfile.isPending}
              >
                {updateProfile.isPending || createProfile.isPending
                  ? 'Saving...'
                  : profile?.status === 'approved' ? 'Save Changes' : 'Save Draft'}
              </Button>
              {profile?.status !== 'approved' && (
                <Button
                  variant="outlined"
                  onClick={() => setConfirmOpen(true)}
                  disabled={submitProfile.isPending}
                >
                  Submit for Review
                </Button>
              )}
            </>
          )}
          {isPending && (
            <Button
              variant="outlined"
              color="warning"
              onClick={() => setRetractConfirmOpen(true)}
              disabled={retractProfile.isPending}
            >
              {retractProfile.isPending ? 'Canceling...' : 'Cancel Submission'}
            </Button>
          )}
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Submit Profile for Review?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Once submitted, you won't be able to edit your profile until the review is complete.
              Make sure all required fields are filled and you've uploaded at least one portfolio sample.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={onSubmitForReview} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Submission Success Dialog */}
        <Dialog open={submitSuccessOpen} onClose={() => setSubmitSuccessOpen(false)}>
          <DialogTitle>Profile Submitted!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Your profile has been successfully submitted for review.
              Please allow 3–5 business days for approval.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSubmitSuccessOpen(false)} variant="contained">
              Got It
            </Button>
          </DialogActions>
        </Dialog>

        {/* Retract Confirm Dialog */}
        <Dialog open={retractConfirmOpen} onClose={() => setRetractConfirmOpen(false)}>
          <DialogTitle>Cancel your submission?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will return your profile to draft status. You can edit and resubmit at any time.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRetractConfirmOpen(false)}>Keep Submitted</Button>
            <Button onClick={onRetract} color="warning" variant="outlined">
              Cancel Submission
            </Button>
          </DialogActions>
        </Dialog>

        {/* Missing Fields Dialog */}
        <Dialog open={missingFieldsOpen} onClose={() => setMissingFieldsOpen(false)}>
          <DialogTitle>Cannot Submit Yet</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
              Please complete the following required fields before submitting:
            </DialogContentText>
            <Box component="ul" sx={{ pl: 4, m: 0 }}>
              {missingFields.map((field) => (
                <Typography component="li" key={field} variant="body1" sx={{ mb: 1 }}>
                  {field}
                </Typography>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMissingFieldsOpen(false)} variant="contained">
              Got It
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </FormProvider>
  );
}

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        py: 3,
        borderBottom: `1px solid ${colors.border.default}`,
        mb: 4,
      }}
    >
      <Typography
        sx={{
          fontFamily: fonts.utility,
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: colors.text.secondary,
        }}
      >
        {title}
      </Typography>
      {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
    </Box>
  );
}
