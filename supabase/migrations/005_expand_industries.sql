-- Add new industry options
-- Note: IDs 1-8 already exist from the initial migration

INSERT INTO industries (id, name, slug) VALUES
  (9,  'Marketplaces',               'marketplaces'),
  (10, 'Travel / Hospitality',       'travel-hospitality'),
  (11, 'Food / Beverage / CPG',      'food-beverage-cpg'),
  (12, 'Automotive',                 'automotive'),
  (13, 'Fashion / Apparel',          'fashion-apparel'),
  (14, 'Home / Garden',              'home-garden'),
  (15, 'Beauty / Personal Care',     'beauty-personal-care'),
  (16, 'B2B / Professional Services','b2b-professional-services'),
  (17, 'Media / Entertainment',      'media-entertainment'),
  (18, 'Fitness / Sports',           'fitness-sports'),
  (19, 'Nonprofit / Cause',          'nonprofit-cause'),
  (20, 'Legal',                      'legal')
ON CONFLICT (slug) DO NOTHING;

-- Ensure the serial sequence is up to date
SELECT setval('industries_id_seq', (SELECT MAX(id) FROM industries));
