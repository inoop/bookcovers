import { useState } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  useBriefOrders,
  useConciergeOrders,
  useInquiries,
  useEmailSubscriptions,
} from '../../api/hooks/useAdminOrders';
import type {
  BriefOrderAdminResponse,
  ConciergeOrderAdminResponse,
  InquiryAdminResponse,
  EmailSubscriptionAdminResponse,
} from '../../api/types';
import { colors } from '../../theme/tokens';

const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'];

const statusColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
  refunded: 'default',
  partially_refunded: 'default',
};

function formatCents(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

function InquiryRow({ inquiry }: { inquiry: InquiryAdminResponse }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{inquiry.name}</TableCell>
        <TableCell>{inquiry.email}</TableCell>
        <TableCell>{inquiry.subject}</TableCell>
        <TableCell sx={{ color: colors.text.muted }}>{inquiry.source_page}</TableCell>
        <TableCell sx={{ color: colors.text.muted }}>{formatDate(inquiry.created_at)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ p: 0 }}>
          <Collapse in={open}>
            <Box sx={{ p: 4, backgroundColor: colors.surface.soft }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {inquiry.message}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function BriefOrdersTab() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data = [], isLoading } = useBriefOrders(statusFilter || undefined);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select value={statusFilter} label="Payment Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {PAYMENT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      {isLoading ? <CircularProgress /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Brief ID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((o: BriefOrderAdminResponse) => (
              <TableRow key={o.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{o.id}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{o.creative_brief_id}</TableCell>
                <TableCell>{formatCents(o.amount, o.currency)}</TableCell>
                <TableCell>
                  <Chip label={o.payment_status} color={statusColor[o.payment_status] ?? 'default'} size="small" />
                </TableCell>
                <TableCell sx={{ color: colors.text.muted }}>{formatDate(o.created_at)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: colors.text.muted }}>No orders.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

function ConciergeOrdersTab() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data = [], isLoading } = useConciergeOrders(statusFilter || undefined);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Payment Status</InputLabel>
          <Select value={statusFilter} label="Payment Status" onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {PAYMENT_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      {isLoading ? <CircularProgress /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((o: ConciergeOrderAdminResponse) => (
              <TableRow key={o.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{o.id}</TableCell>
                <TableCell>{o.service_name}</TableCell>
                <TableCell>{formatCents(o.amount, o.currency)}</TableCell>
                <TableCell>
                  <Chip label={o.payment_status} color={statusColor[o.payment_status] ?? 'default'} size="small" />
                </TableCell>
                <TableCell sx={{ color: colors.text.muted }}>{formatDate(o.created_at)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: colors.text.muted }}>No orders.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

function InquiriesTab() {
  const { data = [], isLoading } = useInquiries();
  return isLoading ? <CircularProgress /> : (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Subject</TableCell>
          <TableCell>Source</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((i: InquiryAdminResponse) => <InquiryRow key={i.id} inquiry={i} />)}
        {data.length === 0 && (
          <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: colors.text.muted }}>No inquiries.</TableCell></TableRow>
        )}
      </TableBody>
    </Table>
  );
}

function SubscriptionsTab() {
  const [confirmedFilter, setConfirmedFilter] = useState('');
  const isConfirmed = confirmedFilter === '' ? undefined : confirmedFilter === 'true';
  const { data = [], isLoading } = useEmailSubscriptions(isConfirmed);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Confirmed</InputLabel>
          <Select value={confirmedFilter} label="Confirmed" onChange={(e) => setConfirmedFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Confirmed</MenuItem>
            <MenuItem value="false">Unconfirmed</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {isLoading ? <CircularProgress /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Confirmed</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((s: EmailSubscriptionAdminResponse) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.subscription_type}</TableCell>
                <TableCell>
                  <Chip label={s.is_confirmed ? 'Yes' : 'No'} color={s.is_confirmed ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell sx={{ color: colors.text.muted }}>{formatDate(s.created_at)}</TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6, color: colors.text.muted }}>No subscriptions.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}

export default function OrdersLeadsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: 4 }}>Orders & Leads</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 4, borderBottom: `1px solid ${colors.border.default}` }}>
        <Tab label="Brief Orders" />
        <Tab label="Concierge Orders" />
        <Tab label="Inquiries" />
        <Tab label="Subscriptions" />
      </Tabs>
      {tab === 0 && <BriefOrdersTab />}
      {tab === 1 && <ConciergeOrdersTab />}
      {tab === 2 && <InquiriesTab />}
      {tab === 3 && <SubscriptionsTab />}
    </Box>
  );
}
