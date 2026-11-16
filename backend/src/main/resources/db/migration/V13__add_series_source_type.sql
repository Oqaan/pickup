alter table series add column source_type text not null default 'manga'
    check (source_type in ('manga', 'light_novel'));
