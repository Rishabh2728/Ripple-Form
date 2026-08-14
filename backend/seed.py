import asyncio
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import engine, Base, AsyncSessionLocal
from app.models.models import User, Workspace, Form, Question, QuestionOption, FormVersion, Response, ResponseAnswer, FormEvent
from app.core.security import get_password_hash
from app.services.form_service import generate_unique_slug

def utc_now():
    return datetime.now(timezone.utc)

async def seed_database():
    print("Recreating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        print("Seeding demo creator user...")
        pwd_hash = get_password_hash("password123")
        user = User(
            name="Alex Morgan",
            email="demo@ripple.com",
            password_hash=pwd_hash,
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            created_at=utc_now() - timedelta(days=30),
            last_login_at=utc_now()
        )
        db.add(user)
        await db.flush()

        workspace = Workspace(
            name="Acme Product Team",
            owner_id=user.id,
            created_at=utc_now() - timedelta(days=30)
        )
        db.add(workspace)
        await db.flush()

        # -------------------------------------------------------------
        # FORM 1: Published SaaS Customer Feedback (Published)
        # -------------------------------------------------------------
        print("Seeding Form 1: SaaS Customer Feedback (Published)...")
        form1 = Form(
            workspace_id=workspace.id,
            title="SaaS Customer Feedback Survey",
            description="Help us shape the future of our product platform by sharing your honest feedback.",
            slug="saas-customer-feedback",
            status="published",
            theme_id="burgundy",
            thank_you_title="Thank You for Your Feedback!",
            thank_you_message="Your insights directly influence our product roadmap. Have a great day!",
            allow_back_navigation=True,
            show_progress=True,
            created_at=utc_now() - timedelta(days=20),
            published_at=utc_now() - timedelta(days=15)
        )
        db.add(form1)
        await db.flush()

        f1_q1 = Question(
            form_id=form1.id, type="short_text", title="What is your full name?",
            description="Let us know who is providing feedback.", required=True, position=0
        )
        f1_q2 = Question(
            form_id=form1.id, type="email", title="What is your work email address?",
            description="We'll send product updates to this email.", required=True, position=1
        )
        f1_q3 = Question(
            form_id=form1.id, type="multiple_choice", title="Which subscription plan are you currently on?",
            required=True, position=2
        )
        f1_q4 = Question(
            form_id=form1.id, type="rating", title="How satisfied are you with our user interface design?",
            description="1 star = Poor, 5 stars = Outstanding", required=True, position=3
        )
        f1_q5 = Question(
            form_id=form1.id, type="nps", title="How likely are you to recommend Ripple to a colleague?",
            description="0 = Not likely at all, 10 = Extremely likely", required=True, position=4
        )
        f1_q6 = Question(
            form_id=form1.id, type="yes_no", title="Have you used our automated integrations?",
            required=True, position=5
        )
        f1_q7 = Question(
            form_id=form1.id, type="long_text", title="What is the single biggest improvement you'd like to see?",
            description="Feel free to share any feature requests or pain points.", required=False, position=6
        )

        db.add_all([f1_q1, f1_q2, f1_q3, f1_q4, f1_q5, f1_q6, f1_q7])
        await db.flush()

        # Options for q3
        opt1 = QuestionOption(question_id=f1_q3.id, label="Starter Plan", value="starter", position=0)
        opt2 = QuestionOption(question_id=f1_q3.id, label="Pro Team Plan", value="pro", position=1)
        opt3 = QuestionOption(question_id=f1_q3.id, label="Enterprise Unlimited", value="enterprise", position=2)
        db.add_all([opt1, opt2, opt3])
        await db.flush()

        # Version Snapshot 1
        ver1_snapshot = {
            "form_id": form1.id, "title": form1.title, "description": form1.description, "slug": form1.slug,
            "theme_id": form1.theme_id, "thank_you_title": form1.thank_you_title, "thank_you_message": form1.thank_you_message,
            "allow_back_navigation": True, "show_progress": True, "published_at": form1.published_at.isoformat(),
            "version_number": 1,
            "questions": [
                {"id": f1_q1.id, "type": f1_q1.type, "title": f1_q1.title, "description": f1_q1.description, "required": True, "position": 0, "settings_json": {}, "options": []},
                {"id": f1_q2.id, "type": f1_q2.type, "title": f1_q2.title, "description": f1_q2.description, "required": True, "position": 1, "settings_json": {}, "options": []},
                {"id": f1_q3.id, "type": f1_q3.type, "title": f1_q3.title, "required": True, "position": 2, "settings_json": {}, "options": [{"id": opt1.id, "label": opt1.label, "value": opt1.value, "position": 0}, {"id": opt2.id, "label": opt2.label, "value": opt2.value, "position": 1}, {"id": opt3.id, "label": opt3.label, "value": opt3.value, "position": 2}]},
                {"id": f1_q4.id, "type": f1_q4.type, "title": f1_q4.title, "description": f1_q4.description, "required": True, "position": 3, "settings_json": {}, "options": []},
                {"id": f1_q5.id, "type": f1_q5.type, "title": f1_q5.title, "description": f1_q5.description, "required": True, "position": 4, "settings_json": {}, "options": []},
                {"id": f1_q6.id, "type": f1_q6.type, "title": f1_q6.title, "required": True, "position": 5, "settings_json": {}, "options": []},
                {"id": f1_q7.id, "type": f1_q7.type, "title": f1_q7.title, "description": f1_q7.description, "required": False, "position": 6, "settings_json": {}, "options": []}
            ]
        }
        form1_ver = FormVersion(
            form_id=form1.id, version_number=1, snapshot_json=ver1_snapshot,
            created_at=form1.published_at, published_at=form1.published_at
        )
        db.add(form1_ver)
        await db.flush()

        # Seed 15 Realistic Responses for Form 1
        print("Seeding 15 realistic responses for Form 1...")
        sample_respondents = [
            ("Sarah Jenkins", "sarah.jenkins@stripe.com", "pro", 5, 10, "Yes", "Dark mode support for night editing would be amazing!"),
            ("Marcus Vance", "m.vance@linear.app", "pro", 4, 9, "Yes", "Keyboard navigation in respondent mode is super fast."),
            ("Elena Rostova", "elena@framer.com", "enterprise", 5, 10, "Yes", "Love the Framer Motion transitions!"),
            ("David Kim", "dkim@techcorp.io", "starter", 3, 7, "No", "Would love more webhook integration options."),
            ("Priya Patel", "priya@designsquad.co", "pro", 5, 9, "Yes", "The autosave and command palette make building forms a breeze."),
            ("Lucas Meyer", "lucas@berlingart.de", "starter", 4, 8, "No", "Add custom font upload support."),
            ("Claire Beauchamp", "claire@healthhub.org", "enterprise", 5, 10, "Yes", "Security compliance and versioning are fantastic."),
            ("James Wilson", "jwilson@scaleup.net", "pro", 4, 8, "Yes", "Export to CSV is clean and well formatted."),
            ("Anita Roy", "anita@analytics.ai", "pro", 5, 10, "Yes", "NPS calculation in analytics saves us time every week."),
            ("Thomas Wright", "twright@buildco.com", "starter", 2, 5, "No", "Pricing could be a bit clearer for small teams."),
            ("Hannah Abbott", "hannah@hogwarts.edu", "pro", 5, 9, "Yes", "Very sleek UI, feels like Notion and Linear."),
            ("Vikram Singh", "vikram@innovate.in", "enterprise", 4, 9, "Yes", "Real-time responses dashboard works great."),
            ("Emily Thorne", "emily@hamptons.com", "pro", 5, 10, "Yes", "Form health auditor helped us catch broken questions before launching."),
            ("Carlos Mendez", "carlos@latamtech.co", "starter", 3, 6, "No", "Mobile respondent view is extremely smooth."),
            ("Rachel Green", "rachel@ralphlauren.com", "pro", 4, 9, "Yes", "Overall fantastic product!")
        ]

        for i, r_data in enumerate(sample_respondents):
            sub_time = utc_now() - timedelta(days=14 - i, hours=random.randint(1, 10))
            comp_secs = random.randint(45, 180)
            resp = Response(
                form_id=form1.id,
                form_version_id=form1_ver.id,
                respondent_token=f"resp-token-{i+100}",
                started_at=sub_time - timedelta(seconds=comp_secs),
                submitted_at=sub_time,
                completion_time_seconds=comp_secs,
                status="completed"
            )
            db.add(resp)
            await db.flush()

            answers = [
                ResponseAnswer(response_id=resp.id, question_id=f1_q1.id, value=r_data[0]),
                ResponseAnswer(response_id=resp.id, question_id=f1_q2.id, value=r_data[1]),
                ResponseAnswer(response_id=resp.id, question_id=f1_q3.id, value=r_data[2]),
                ResponseAnswer(response_id=resp.id, question_id=f1_q4.id, value=r_data[3]),
                ResponseAnswer(response_id=resp.id, question_id=f1_q5.id, value=r_data[4]),
                ResponseAnswer(response_id=resp.id, question_id=f1_q6.id, value=r_data[5]),
                ResponseAnswer(response_id=resp.id, question_id=f1_q7.id, value=r_data[6])
            ]
            db.add_all(answers)

        # -------------------------------------------------------------
        # FORM 2: Event Registration 2026 (Published)
        # -------------------------------------------------------------
        print("Seeding Form 2: Tech Conference Registration (Published)...")
        form2 = Form(
            workspace_id=workspace.id,
            title="Tech Conference 2026 Registration",
            description="Reserve your spot for the annual engineering keynote and developer sessions.",
            slug="tech-conference-2026-registration",
            status="published",
            theme_id="midnight",
            thank_you_title="Registration Confirmed!",
            thank_you_message="We've saved your seat. Check your email for ticket confirmation details.",
            created_at=utc_now() - timedelta(days=10),
            published_at=utc_now() - timedelta(days=8)
        )
        db.add(form2)
        await db.flush()

        f2_q1 = Question(form_id=form2.id, type="short_text", title="Full Name", required=True, position=0)
        f2_q2 = Question(form_id=form2.id, type="email", title="Email Address", required=True, position=1)
        f2_q3 = Question(form_id=form2.id, type="dropdown", title="Select Ticket Type", required=True, position=2)
        f2_q4 = Question(form_id=form2.id, type="yes_no", title="Attending the Evening Reception?", required=True, position=3)

        db.add_all([f2_q1, f2_q2, f2_q3, f2_q4])
        await db.flush()

        f2_opt1 = QuestionOption(question_id=f2_q3.id, label="General Admission", value="general", position=0)
        f2_opt2 = QuestionOption(question_id=f2_q3.id, label="VIP All-Access", value="vip", position=1)
        db.add_all([f2_opt1, f2_opt2])
        await db.flush()

        f2_ver_snapshot = {
            "form_id": form2.id, "title": form2.title, "slug": form2.slug, "theme_id": form2.theme_id,
            "thank_you_title": form2.thank_you_title, "thank_you_message": form2.thank_you_message,
            "allow_back_navigation": True, "show_progress": True, "published_at": form2.published_at.isoformat(),
            "version_number": 1,
            "questions": [
                {"id": f2_q1.id, "type": f2_q1.type, "title": f2_q1.title, "required": True, "position": 0, "settings_json": {}, "options": []},
                {"id": f2_q2.id, "type": f2_q2.type, "title": f2_q2.title, "required": True, "position": 1, "settings_json": {}, "options": []},
                {"id": f2_q3.id, "type": f2_q3.type, "title": f2_q3.title, "required": True, "position": 2, "settings_json": {}, "options": [{"id": f2_opt1.id, "label": f2_opt1.label, "value": f2_opt1.value, "position": 0}, {"id": f2_opt2.id, "label": f2_opt2.label, "value": f2_opt2.value, "position": 1}]},
                {"id": f2_q4.id, "type": f2_q4.type, "title": f2_q4.title, "required": True, "position": 3, "settings_json": {}, "options": []}
            ]
        }
        form2_ver = FormVersion(
            form_id=form2.id, version_number=1, snapshot_json=f2_ver_snapshot,
            created_at=form2.published_at, published_at=form2.published_at
        )
        db.add(form2_ver)
        await db.flush()

        # Seed 10 responses for Form 2
        for i in range(10):
            sub_time = utc_now() - timedelta(days=7 - i)
            resp = Response(
                form_id=form2.id, form_version_id=form2_ver.id,
                respondent_token=f"event-token-{i+1}", started_at=sub_time - timedelta(seconds=60),
                submitted_at=sub_time, completion_time_seconds=60, status="completed"
            )
            db.add(resp)
            await db.flush()
            db.add_all([
                ResponseAnswer(response_id=resp.id, question_id=f2_q1.id, value=f"Attendee {i+1}"),
                ResponseAnswer(response_id=resp.id, question_id=f2_q2.id, value=f"attendee{i+1}@event.com"),
                ResponseAnswer(response_id=resp.id, question_id=f2_q3.id, value="vip" if i % 3 == 0 else "general"),
                ResponseAnswer(response_id=resp.id, question_id=f2_q4.id, value="Yes" if i % 2 == 0 else "No")
            ])

        # -------------------------------------------------------------
        # FORM 3 & 4: Draft Forms
        # -------------------------------------------------------------
        print("Seeding Form 3 & 4: Draft Forms...")
        form3 = Form(
            workspace_id=workspace.id,
            title="Q3 Employee Engagement Pulse",
            description="Quarterly check-in on workplace satisfaction.",
            slug="q3-employee-engagement-pulse",
            status="draft",
            theme_id="forest",
            created_at=utc_now() - timedelta(days=5)
        )
        db.add(form3)
        await db.flush()
        db.add_all([
            Question(form_id=form3.id, type="rating", title="I feel supported by my manager.", required=True, position=0),
            Question(form_id=form3.id, type="long_text", title="Any suggestions for team outings?", required=False, position=1)
        ])

        form4 = Form(
            workspace_id=workspace.id,
            title="Product Beta Tester Screening",
            description="Filter candidate beta testers for our upcoming v2 launch.",
            slug="product-beta-tester-screening",
            status="draft",
            theme_id="ocean",
            created_at=utc_now() - timedelta(days=2)
        )
        db.add(form4)
        await db.flush()
        db.add_all([
            Question(form_id=form4.id, type="short_text", title="Operating System (macOS, Windows, Linux)", required=True, position=0),
            Question(form_id=form4.id, type="number", title="Hours per week spent in form builders", required=True, position=1)
        ])

        # -------------------------------------------------------------
        # FORM 5: Archived Form
        # -------------------------------------------------------------
        print("Seeding Form 5: Archived Form...")
        form5 = Form(
            workspace_id=workspace.id,
            title="Legacy Q1 2025 Feedback (Archived)",
            description="Archived feedback survey from early 2025.",
            slug="legacy-q1-2025-feedback",
            status="archived",
            theme_id="minimal",
            created_at=utc_now() - timedelta(days=120)
        )
        db.add(form5)
        await db.flush()
        db.add(Question(form_id=form5.id, type="short_text", title="Legacy question", required=False, position=0))

        await db.commit()
        print("\nSuccessfully seeded database with:")
        print(" - Demo User: demo@ripple.com / password123")
        print(" - Workspace: Acme Product Team")
        print(" - 5 Forms (2 Published, 2 Draft, 1 Archived)")
        print(" - 25+ Realistic Completed Responses with version snapshots and analytics!")

if __name__ == "__main__":
    asyncio.run(seed_database())
