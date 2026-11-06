-- Run after migration in privileged SQL editor; everything rolls back.
begin;
insert into public.paintings(id,title) values ('10000000-0000-4000-8000-000000000001','Private policy test');
set local role anon;
do $$ begin
 if exists(select 1 from public.paintings where id='10000000-0000-4000-8000-000000000001') then raise exception 'Draft leaked'; end if;
 if public.is_artist() then raise exception 'Anonymous artist access'; end if;
 begin
 insert into public.paintings(title) values ('Unauthorized');
 raise exception 'Anonymous insert allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','20000000-0000-4000-8000-000000000002',true);
do $$ begin
 if public.is_artist() then raise exception 'Non artist authorized'; end if;
 if exists(select 1 from public.paintings where id='10000000-0000-4000-8000-000000000001') then raise exception 'Private row leaked'; end if;
 begin
 insert into public.paintings(title) values ('Unauthorized');
 raise exception 'Non artist insert allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
do $$ begin
 begin
 update public.paintings set visibility='published' where id='10000000-0000-4000-8000-000000000001';
 raise exception 'Incomplete publication allowed';
 exception when check_violation then null;
 end;
 begin
 update public.paintings set width=-1 where id='10000000-0000-4000-8000-000000000001';
 raise exception 'Negative width allowed';
 exception when check_violation then null;
 end;
end $$;
rollback;
