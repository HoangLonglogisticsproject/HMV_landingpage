ALTER TABLE public.rfqs
  ADD COLUMN product_format text NOT NULL DEFAULT 'To be discussed',
  ADD COLUMN frequency text NOT NULL DEFAULT '',
  ADD COLUMN documents text NOT NULL DEFAULT '',
  ADD COLUMN locale text NOT NULL DEFAULT 'en';
ALTER TABLE public.rfqs
  ADD CONSTRAINT rfqs_product_format_check CHECK (product_format IN ('Raw material','Fresh','Semi-processed','Processed','To be discussed')),
  ADD CONSTRAINT rfqs_frequency_len CHECK (char_length(frequency) <= 100),
  ADD CONSTRAINT rfqs_documents_len CHECK (char_length(documents) <= 1000),
  ADD CONSTRAINT rfqs_locale_check CHECK (locale IN ('en','vi'));