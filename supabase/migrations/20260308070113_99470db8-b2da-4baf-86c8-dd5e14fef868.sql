-- Admin can view all wallets
CREATE POLICY "Admins can view all wallets"
ON public.wallets FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin can update transactions (for approving/rejecting withdrawals)
CREATE POLICY "Admins can update transactions"
ON public.transactions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
