CREATE TABLE public.rfqs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
 company text NOT NULL CHECK (char_length(company) BETWEEN 2 AND 150),
 email text NOT NULL CHECK (char_length(email) <= 254),
 product text NOT NULL CHECK (char_length(product) BETWEEN 2 AND 150),
 quantity text NOT NULL CHECK (char_length(quantity) BETWEEN 1 AND 100),
 destination text NOT NULL CHECK (char_length(destination) BETWEEN 2 AND 150),
 incoterm text NOT NULL CHECK (incoterm IN ('To be agreed','EXW','FCA','FOB','CFR','CIF','DAP')),
 requirements text NOT NULL DEFAULT '' CHECK (char_length(requirements) <= 3000)
);
GRANT INSERT (name,company,email,product,quantity,destination,incoterm,requirements) ON public.rfqs TO anon;
GRANT ALL ON public.rfqs TO service_role;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit RFQs only" ON public.rfqs FOR INSERT TO anon WITH CHECK (true);
CREATE FUNCTION public.limit_rfq_submissions() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext(lower(NEW.email)));
 IF (SELECT count(*) FROM public.rfqs WHERE lower(email)=lower(NEW.email) AND created_at > now() - interval '1 hour') >= 5 THEN
 RAISE EXCEPTION 'Submission limit reached. Please email our team.';
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.limit_rfq_submissions() FROM PUBLIC;
CREATE TRIGGER rfq_submission_limit BEFORE INSERT ON public.rfqs FOR EACH ROW EXECUTE FUNCTION public.limit_rfq_submissions();