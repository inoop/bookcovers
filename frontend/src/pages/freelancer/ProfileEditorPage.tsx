import { useEffect, useState } from 'react';
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
import { useOwnProfile, useCreateProfile, useUpdateProfile, useSubmitProfile } from '../../api/hooks/useProfile';
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

  const { data: audienceTerms } = useTaxonomy('audience');
  const { data: styleTerms } = useTaxonomy('style');
  const { data: genreTerms } = useTaxonomy('genre');
  const { data: imageTagTerms } = useTaxonomy('image_tag');

  const { data: portfolioAssets } = useOwnPortfolio();
  const uploadAsset = useUploadAsset();
  const deleteAsset = useDeleteAsset();

  const [aboutOpen, setAboutOpen] = useState(true);
  const [classOpen, setClassOpen] = useState(true);
  const [selfIdOpen, setSelfIdOpen] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [missingFieldsOpen, setMissingFieldsOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
  const isEditable = !profile || profile.status === 'draft' || profile.status === 'changes_requested';

  const onSave = async (data: ProfileUpdateRequest) => {
    setSaveMsg(null);
    setSubmitError(null);
    try {
      if (isNew) {
        await createProfile.mutateAsync({
          name: data.name || 'New Profile',
          email: data.email || '',
        });
        // After creation, update with full data
        await updateProfile.mutateAsync(data);
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
        await updateProfile.mutateAsync(formData);
      } else {
        await updateProfile.mutateAsync(formData);
      }
      await submitProfile.mutateAsync();
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
              label={profile.status.replace('_', ' ').toUpperCase()}
              size="small"
              sx={{
                backgroundColor: STATUS_COLORS[profile.status] || colors.text.muted,
                color: '#fff',
                fontFamily: fonts.utility,
                fontSize: '0.6875rem',
                letterSpacing: '0.05em',
              }}
            />
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

        {/* Section 1: About Me */}
        <SectionHeader title="About Me" open={aboutOpen} onToggle={() => setAboutOpen(!aboutOpen)} />
        <Collapse in={aboutOpen}>
          <Box sx={{ display: 'grid', gap: 5, mb: 6 }}>
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
                <FormFileUpload onUpload={async (file) => { await uploadAsset.mutateAsync(file); }} />
              )}

              {(portfolioAssets ?? []).length > 0 && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: 3,
                    mt: 4,
                  }}
                >
                  {(portfolioAssets ?? []).map((asset) => (
                    <Box
                      key={asset.id}
                      sx={{
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${colors.border.default}`,
                      }}
                    >
                      <Box
                        sx={{
                          height: 120,
                          backgroundColor: colors.surface.raised,
                          backgroundImage: asset.media_url ? `url(${asset.media_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
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
                  ))}
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
                {updateProfile.isPending || createProfile.isPending ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setConfirmOpen(true)}
                disabled={submitProfile.isPending}
              >
                Submit for Review
              </Button>
            </>
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
