GRANT INSERT ON public.rfqs TO anon, authenticated;
GRANT ALL ON public.rfqs TO service_role;
DROP POLICY IF EXISTS "Signed-in visitors can submit RFQs" ON public.rfqs;
CREATE POLICY "Signed-in visitors can submit RFQs" ON public.rfqs FOR INSERT TO authenticated WITH CHECK (true);