# Cold-outreach emails for Estonian teachers and schools

Templates for first contact. Keep them short — a teacher decides in the subject
line and the first two sentences.

Replace `[NAME]`, `[SCHOOL]` and `[WHERE YOU FOUND THEM]` every time. A mail that
shows you looked them up gets answered; a blast does not.

**These are in English on purpose.** An Estonian version was drafted and dropped:
neither you nor I can vouch for its grammar, and a mistake in it would be the
worst possible first impression for a tool that corrects Estonian grammar.
Writing in English is also simply true to who is writing — a learner, not a
native speaker — and every Estonian teacher of adults reads English.

---

## English

**Subject:** A free A1–A2 Estonian writing exercise, built by a learner

Hi [NAME],

I found [SCHOOL] while looking for people who teach Estonian to adults
[WHERE YOU FOUND THEM].

I'm learning Estonian myself, and I built a small free tool for the part I kept
getting stuck on: not vocabulary, but putting the cases and verb forms together
in an actual sentence. It gives you a few random Estonian words, you write one
sentence using all of them, and it tells you what's wrong and which rule explains
it.

It's at eestiroll.ee — free, no account, works in a browser on a phone. There's a
page for teachers here: eestiroll.ee/teachers

I'm not selling anything. What I'd really like is to know whether it's any use to
someone who actually teaches this. If you have five minutes to try a round and
tell me where it falls short, that would help me more than any number of users.

Thank you for your time,
Andrea

---

## Shorter variant, if the first one feels too long

**Subject:** Free Estonian writing practice — would value your opinion

Hi [NAME],

I'm learning Estonian and built a free exercise for the thing I kept failing at:
turning words I know into a correct sentence. You roll a few random words, write
one sentence with all of them, and get told what's wrong and why.

eestiroll.ee — free, no account, works on a phone.

I'd value five minutes of a teacher's opinion more than a hundred users. Is it
any use to you, and what's missing?

Thank you,
Andrea

---

## Before you send any of these

**The daily AI limit is counted per IP address.** A whole class on the school's
Wi-Fi shares one public address, so they would share a handful of checks between
all of them and most students would hit the cap on their first sentence. This is
in `check_view` on the backend: anonymous users are keyed `ip:{ip}`.

Until that changes, do not invite a teacher to run this with a class — it will
fail in front of their students and you only get one first impression. Either
reach out for one-to-one feedback first (what these templates do), or raise the
limit for the school's address before the lesson.

The `/teachers` page is worded to steer them toward asking before trying it with
a group, and its "Unlock teacher access" button opens a short form (name, email,
school, group size) that lands in the `feedback` table with
`source = 'teacher_access'` — so a request arrives with everything needed to
raise the limit and write back.
