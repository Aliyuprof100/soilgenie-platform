from django.db.models import Avg, Sum

from django.utils.timezone import localtime



from rest_framework.permissions import BasePermission, IsAuthenticated

from rest_framework.response import Response

from rest_framework.views import APIView



from .models import User



from apps.farmers.models import Farmer

from apps.farms.models import Farm



from apps.soil.models import (

    SoilSample,

    SoilTest,

    SoilTestResult,

    SoilAnalysis,

)





# ============================================================

# ADMIN PERMISSION

# ============================================================





class IsSoilGenieAdmin(BasePermission):

    """

    Allows access to authenticated SoilGenie administrators.



    Supported administrator accounts:



    1. role=ADMIN

    2. is_staff=True

    3. is_superuser=True

    """



    message = "Administrator access is required."



    def has_permission(self, request, view):

        user = request.user



        return bool(

            user

            and user.is_authenticated

            and (

                getattr(user, "role", None)

                == User.Roles.ADMIN

                or getattr(user, "is_staff", False)

                or getattr(user, "is_superuser", False)

            )

        )





# ============================================================

# ADMIN DASHBOARD

# ============================================================





class AdminDashboardView(APIView):

    """

    Main SoilGenie administration dashboard.



    Provides:



    - Platform overview

    - Soil test status

    - Recent farmers

    - Recent farms

    - Recent soil tests

    - Agent performance

    - Soil health analytics

    - System health

    """



    permission_classes = [

        IsAuthenticated,

        IsSoilGenieAdmin,

    ]



    def get(self, request):



        # ====================================================

        # USERS

        # ====================================================



        total_users = User.objects.count()



        total_agents = User.objects.filter(

            role=User.Roles.AGENT

        ).count()



        active_agents = User.objects.filter(

            role=User.Roles.AGENT,

            is_active=True,

        ).count()



        total_admins = User.objects.filter(

            role=User.Roles.ADMIN

        ).count()



        # ====================================================

        # FARMERS

        # ====================================================



        total_farmers = Farmer.objects.count()



        # ====================================================

        # FARMS

        # ====================================================



        total_farms = Farm.objects.count()



        total_farm_area = (

            Farm.objects.aggregate(

                total=Sum("farm_size")

            )["total"]

            or 0

        )



        # ====================================================

        # SOIL OPERATIONS

        # ====================================================



        total_samples = SoilSample.objects.count()



        total_tests = SoilTest.objects.count()



        completed_tests = SoilTest.objects.filter(

            status="COMPLETED"

        ).count()



        pending_tests = (

            SoilTest.objects

            .exclude(status="COMPLETED")

            .exclude(status="FAILED")

            .count()

        )



        failed_tests = SoilTest.objects.filter(

            status="FAILED"

        ).count()



        completed_assessments = SoilAnalysis.objects.count()



        # ====================================================

        # SOIL TEST STATUS

        # ====================================================



        test_status = {

            "completed": completed_tests,

            "pending": pending_tests,

            "failed": failed_tests,

        }



        # ====================================================

        # RECENT FARMERS

        # ====================================================



        recent_farmers = []



        farmers = (

            Farmer.objects

            .select_related("registered_by")

            .order_by("-created_at")[:8]

        )



        for farmer in farmers:



            registered_by = farmer.registered_by



            recent_farmers.append(

                {

                    "id": str(farmer.id),



                    "farmer_id": farmer.farmer_id,



                    "name": (

                        f"{farmer.first_name} "

                        f"{farmer.last_name}"

                    ).strip(),



                    "phone_number": farmer.phone_number,



                    "state": farmer.state,



                    "lga": farmer.lga,



                    "agent": (

                        f"{registered_by.first_name} "

                        f"{registered_by.last_name}"

                    ).strip()

                    if registered_by

                    else "System",



                    "agent_id": (

                        str(registered_by.id)

                        if registered_by

                        else None

                    ),



                    "created_at": (

                        localtime(

                            farmer.created_at

                        ).isoformat()

                        if farmer.created_at

                        else None

                    ),

                }

            )



        # ====================================================

        # RECENT FARMS

        # ====================================================



        recent_farms = []



        farms = (

            Farm.objects

            .select_related(

                "farmer",

                "registered_by",

            )

            .order_by("-created_at")[:8]

        )



        for farm in farms:



            registered_by = farm.registered_by



            recent_farms.append(

                {

                    "id": str(farm.id),



                    "farm_id": farm.farm_id,



                    "farm_name": farm.farm_name,



                    "farmer": (

                        f"{farm.farmer.first_name} "

                        f"{farm.farmer.last_name}"

                    ).strip()

                    if farm.farmer

                    else "Unknown",



                    "farmer_id": (

                        farm.farmer.farmer_id

                        if farm.farmer

                        else None

                    ),



                    "size": float(

                        farm.farm_size

                    ),



                    "state": farm.state,



                    "lga": farm.lga,



                    "agent": (

                        f"{registered_by.first_name} "

                        f"{registered_by.last_name}"

                    ).strip()

                    if registered_by

                    else "System",



                    "created_at": (

                        localtime(

                            farm.created_at

                        ).isoformat()

                        if farm.created_at

                        else None

                    ),

                }

            )



        # ====================================================

        # RECENT SOIL TESTS

        # ====================================================



        recent_tests = []



        tests = (

            SoilTest.objects

            .select_related(

                "sample",

                "sample__farm",

                "sample__farm__farmer",

                "sample__collected_by",

            )

            .order_by("-created_at")[:8]

        )



        for test in tests:



            sample = test.sample



            farm = (

                sample.farm

                if sample

                else None

            )



            farmer = (

                farm.farmer

                if farm

                else None

            )



            collector = (

                sample.collected_by

                if sample

                else None

            )



            recent_tests.append(

                {

                    "id": str(test.id),



                    "test_id": str(

                        test.test_id

                    ),



                    "sample_id": (

                        sample.sample_id

                        if sample

                        else None

                    ),



                    "farm_name": (

                        farm.farm_name

                        if farm

                        else "Unknown"

                    ),



                    "farmer": (

                        f"{farmer.first_name} "

                        f"{farmer.last_name}"

                    ).strip()

                    if farmer

                    else "Unknown",



                    "agent": (

                        f"{collector.first_name} "

                        f"{collector.last_name}"

                    ).strip()

                    if collector

                    else "Unassigned",



                    "status": test.status,



                    "created_at": (

                        localtime(

                            test.created_at

                        ).isoformat()

                        if test.created_at

                        else None

                    ),



                    "tested_at": (

                        localtime(

                            test.tested_at

                        ).isoformat()

                        if test.tested_at

                        else None

                    ),

                }

            )



        # ====================================================

        # AGENT PERFORMANCE

        # ====================================================

        #

        # Metrics follow the actual SoilGenie relationships:

        #

        # Farmers:

        #   Farmer.registered_by

        #

        # Farms:

        #   Farm.registered_by

        #

        # Samples:

        #   SoilSample.collected_by

        #

        # Tests:

        #   SoilTest -> SoilSample -> collected_by

        #

        # Assessments:

        #   SoilAnalysis -> SoilTest -> SoilSample

        #   -> collected_by

        #

        # ====================================================



        agent_performance = []



        agents = (

            User.objects

            .filter(

                role=User.Roles.AGENT

            )

            .order_by(

                "first_name",

                "last_name",

            )

        )



        for agent in agents:



            # -----------------------------------------------

            # Farmers registered by agent

            # -----------------------------------------------



            farmer_count = (

                Farmer.objects

                .filter(

                    registered_by=agent

                )

                .count()

            )



            # -----------------------------------------------

            # Farms registered by agent

            # -----------------------------------------------



            farm_count = (

                Farm.objects

                .filter(

                    registered_by=agent

                )

                .count()

            )



            # -----------------------------------------------

            # Soil samples collected by agent

            # -----------------------------------------------



            sample_count = (

                SoilSample.objects

                .filter(

                    collected_by=agent

                )

                .count()

            )



            # -----------------------------------------------

            # Soil tests associated with samples

            # collected by this agent

            # -----------------------------------------------



            test_count = (

                SoilTest.objects

                .filter(

                    sample__collected_by=agent

                )

                .count()

            )



            # -----------------------------------------------

            # Completed tests

            # -----------------------------------------------



            completed_test_count = (

                SoilTest.objects

                .filter(

                    sample__collected_by=agent,

                    status="COMPLETED",

                )

                .count()

            )



            # -----------------------------------------------

            # Failed tests

            # -----------------------------------------------



            failed_test_count = (

                SoilTest.objects

                .filter(

                    sample__collected_by=agent,

                    status="FAILED",

                )

                .count()

            )



            # -----------------------------------------------

            # Pending tests

            # -----------------------------------------------



            pending_test_count = (

                SoilTest.objects

                .filter(

                    sample__collected_by=agent

                )

                .exclude(

                    status="COMPLETED"

                )

                .exclude(

                    status="FAILED"

                )

                .count()

            )



            # -----------------------------------------------

            # Assessments generated from this agent's tests

            # -----------------------------------------------



            assessment_count = (

                SoilAnalysis.objects

                .filter(

                    test__sample__collected_by=agent

                )

                .count()

            )



            # -----------------------------------------------

            # Activity score

            # -----------------------------------------------



            activity_score = (

                farmer_count

                + farm_count

                + sample_count

                + test_count

                + assessment_count

            )



            # -----------------------------------------------

            # Agent record

            # -----------------------------------------------



            agent_performance.append(

                {

                    "id": str(agent.id),



                    "name": (

                        f"{agent.first_name} "

                        f"{agent.last_name}"

                    ).strip(),



                    "email": agent.email,



                    "farmers": farmer_count,



                    "farms": farm_count,



                    "samples": sample_count,



                    "tests": test_count,



                    "completed_tests": (

                        completed_test_count

                    ),



                    "pending_tests": (

                        pending_test_count

                    ),



                    "failed_tests": (

                        failed_test_count

                    ),



                    "assessments": (

                        assessment_count

                    ),



                    "active": agent.is_active,



                    "activity_score": (

                        activity_score

                    ),

                }

            )



        # Highest operational activity first.

        agent_performance.sort(

            key=lambda item: (

                item["activity_score"],

                item["assessments"],

                item["completed_tests"],

                item["samples"],

                item["farms"],

                item["farmers"],

            ),

            reverse=True,

        )



        # Keep the top 10 agents.

        agent_performance = (

            agent_performance[:10]

        )



        # ====================================================

        # SOIL HEALTH ANALYTICS

        # ====================================================

        #

        # SoilTestResult contains the actual measured values:

        #

        #   ph

        #   nitrogen_mg_kg

        #   phosphorus_mg_kg

        #   potassium_mg_kg

        #   organic_matter_percent

        #

        # We calculate platform-wide averages only from

        # measurements that actually exist.

        #

        # ====================================================



        soil_result_averages = (

            SoilTestResult.objects

            .filter(

                test__status="COMPLETED"

            )

            .aggregate(

                average_ph=Avg("ph"),



                average_nitrogen=Avg(

                    "nitrogen_mg_kg"

                ),



                average_phosphorus=Avg(

                    "phosphorus_mg_kg"

                ),



                average_potassium=Avg(

                    "potassium_mg_kg"

                ),



                average_organic_matter=Avg(

                    "organic_matter_percent"

                ),

            )

        )



        def decimal_to_float(value):

            if value is None:

                return None



            return round(

                float(value),

                2,

            )



        soil_health = {

            "pH": decimal_to_float(

                soil_result_averages[

                    "average_ph"

                ]

            ),



            "nitrogen": decimal_to_float(

                soil_result_averages[

                    "average_nitrogen"

                ]

            ),



            "phosphorus": decimal_to_float(

                soil_result_averages[

                    "average_phosphorus"

                ]

            ),



            "potassium": decimal_to_float(

                soil_result_averages[

                    "average_potassium"

                ]

            ),



            "organic_matter": decimal_to_float(

                soil_result_averages[

                    "average_organic_matter"

                ]

            ),

        }



        # Number of completed test-result records

        # contributing to the analytics.

        soil_health_measurements = (

            SoilTestResult.objects

            .filter(

                test__status="COMPLETED"

            )

            .count()

        )



        # ====================================================

        # RESPONSE

        # ====================================================



        return Response(

            {

                "overview": {

                    "total_users": total_users,



                    "total_admins": total_admins,



                    "total_agents": total_agents,



                    "active_agents": active_agents,



                    "total_farmers": total_farmers,



                    "total_farms": total_farms,



                    "total_farm_area": float(

                        total_farm_area

                    ),



                    "total_samples": total_samples,



                    "total_tests": total_tests,



                    "completed_tests": completed_tests,



                    "pending_tests": pending_tests,



                    "failed_tests": failed_tests,



                    "completed_assessments": (

                        completed_assessments

                    ),

                },



                "test_status": test_status,



                "soil_health": soil_health,



                "soil_health_measurements": (

                    soil_health_measurements

                ),



                "recent_farmers": recent_farmers,



                "recent_farms": recent_farms,



                "recent_tests": recent_tests,



                "agent_performance": (

                    agent_performance

                ),



                "system": {

                    "api": "Operational",



                    "database": "Connected",



                    "weather": "Available",

                },

            }

        )

# ================================================================

# ADMIN AGENT MANAGEMENT

# ================================================================





class AdminAgentsView(APIView):

    """

    Platform-wide agent management endpoint.



    Returns all SoilGenie users whose role is AGENT,

    together with their operational statistics.

    """



    permission_classes = [

        IsAuthenticated,

        IsSoilGenieAdmin,

    ]



    def get(self, request):



        agents = (

            User.objects

            .filter(

                role=User.Roles.AGENT

            )

            .order_by(

                "first_name",

                "last_name",

            )

        )



        results = []



        for agent in agents:



            # ----------------------------------------------------

            # Farmers registered by this agent

            # ----------------------------------------------------



            farmers_count = (

                Farmer.objects

                .filter(

                    registered_by=agent

                )

                .count()

            )



            # ----------------------------------------------------

            # Farms registered by this agent

            # ----------------------------------------------------



            farms_queryset = (

                Farm.objects

                .filter(

                    registered_by=agent

                )

            )



            farms_count = farms_queryset.count()



            farm_area = (

                farms_queryset.aggregate(

                    total=Sum("farm_size")

                )["total"]

                or 0

            )



            # ----------------------------------------------------

            # Soil samples collected by this agent

            # ----------------------------------------------------



            samples_count = (

                SoilSample.objects

                .filter(

                    collected_by=agent

                )

                .count()

            )



            # ----------------------------------------------------

            # Soil tests associated with this agent

            # ----------------------------------------------------



            tests_queryset = (

                SoilTest.objects

                .filter(

                    sample__collected_by=agent

                )

            )



            tests_count = tests_queryset.count()



            completed_tests = (

                tests_queryset

                .filter(

                    status="COMPLETED"

                )

                .count()

            )



            pending_tests = (

                tests_queryset

                .exclude(

                    status="COMPLETED"

                )

                .exclude(

                    status="FAILED"

                )

                .count()

            )



            failed_tests = (

                tests_queryset

                .filter(

                    status="FAILED"

                )

                .count()

            )



            # ----------------------------------------------------

            # Soil assessments

            # ----------------------------------------------------



            assessments_count = (

                SoilAnalysis.objects

                .filter(

                    test__sample__collected_by=agent

                )

                .count()

            )



            # ----------------------------------------------------

            # Activity score

            # ----------------------------------------------------



            activity_score = (

                farmers_count

                + farms_count

                + samples_count

                + tests_count

                + assessments_count

            )



            # ----------------------------------------------------

            # Agent response

            # ----------------------------------------------------



            results.append(

                {

                    "id": str(agent.id),



                    "name": (

                        f"{agent.first_name} "

                        f"{agent.last_name}"

                    ).strip(),



                    "email": agent.email,



                    "phone_number":

                        agent.phone_number,



                    "role":

                        agent.role,



                    "is_active":

                        agent.is_active,



                    "email_verified":

                        agent.email_verified,



                    "phone_verified":

                        agent.phone_verified,



                    "date_joined": (

                        localtime(

                            agent.date_joined

                        ).isoformat()

                        if agent.date_joined

                        else None

                    ),



                    "farmers":

                        farmers_count,



                    "farms":

                        farms_count,



                    "farm_area":

                        round(

                            float(farm_area),

                            2,

                        ),



                    "samples":

                        samples_count,



                    "tests":

                        tests_count,



                    "completed_tests":

                        completed_tests,



                    "pending_tests":

                        pending_tests,



                    "failed_tests":

                        failed_tests,



                    "assessments":

                        assessments_count,



                    "activity_score":

                        activity_score,

                }

            )



        # --------------------------------------------------------

        # Highest operational activity first

        # --------------------------------------------------------



        results.sort(

            key=lambda item: (

                item["activity_score"],

                item["assessments"],

                item["completed_tests"],

                item["samples"],

                item["farms"],

                item["farmers"],

            ),

            reverse=True,

        )



        return Response(

            {

                "count": len(results),

                "agents": results,

            }

        )





# ================================================================

# ADMIN AGENT PROFILE

# ================================================================





class AdminAgentDetailView(APIView):

    """

    Detailed platform-wide profile for one SoilGenie agent.

    """



    permission_classes = [

        IsAuthenticated,

        IsSoilGenieAdmin,

    ]



    def get(self, request, agent_id):



        # --------------------------------------------------------

        # Find agent

        # --------------------------------------------------------



        try:

            agent = User.objects.get(

                id=agent_id,

                role=User.Roles.AGENT,

            )

        except User.DoesNotExist:

            return Response(

                {

                    "detail":

                    "Agent not found."

                },

                status=404,

            )



        # --------------------------------------------------------

        # Farmers

        # --------------------------------------------------------



        farmers_queryset = (

            Farmer.objects

            .filter(

                registered_by=agent

            )

            .order_by(

                "-created_at"

            )

        )



        farmers_count = (

            farmers_queryset.count()

        )



        # --------------------------------------------------------

        # Farms

        # --------------------------------------------------------



        farms_queryset = (

            Farm.objects

            .filter(

                registered_by=agent

            )

            .select_related(

                "farmer"

            )

            .order_by(

                "-created_at"

            )

        )



        farms_count = farms_queryset.count()



        farm_area = (

            farms_queryset.aggregate(

                total=Sum("farm_size")

            )["total"]

            or 0

        )



        # --------------------------------------------------------

        # Soil samples

        # --------------------------------------------------------



        samples_queryset = (

            SoilSample.objects

            .filter(

                collected_by=agent

            )

            .select_related(

                "farm",

                "farm__farmer",

            )

            .order_by(

                "-collection_date"

            )

        )



        samples_count = (

            samples_queryset.count()

        )



        # --------------------------------------------------------

        # Soil tests

        # --------------------------------------------------------



        tests_queryset = (

            SoilTest.objects

            .filter(

                sample__collected_by=agent

            )

            .select_related(

                "sample",

                "sample__farm",

                "sample__farm__farmer",

            )

            .order_by(

                "-created_at"

            )

        )



        tests_count = (

            tests_queryset.count()

        )



        completed_tests = (

            tests_queryset

            .filter(

                status="COMPLETED"

            )

            .count()

        )



        pending_tests = (

            tests_queryset

            .exclude(

                status="COMPLETED"

            )

            .exclude(

                status="FAILED"

            )

            .count()

        )



        failed_tests = (

            tests_queryset

            .filter(

                status="FAILED"

            )

            .count()

        )



        # --------------------------------------------------------

        # Assessments

        # --------------------------------------------------------



        assessments_count = (

            SoilAnalysis.objects

            .filter(

                test__sample__collected_by=agent

            )

            .count()

        )



        # --------------------------------------------------------

        # Activity score

        # --------------------------------------------------------



        activity_score = (

            farmers_count

            + farms_count

            + samples_count

            + tests_count

            + assessments_count

        )



        # ========================================================

        # RECENT FARMERS

        # ========================================================



        recent_farmers = []



        for farmer in farmers_queryset[:10]:



            recent_farmers.append(

                {

                    "id":

                        str(farmer.id),



                    "farmer_id":

                        farmer.farmer_id,



                    "name": (

                        f"{farmer.first_name} "

                        f"{farmer.last_name}"

                    ).strip(),



                    "phone_number":

                        farmer.phone_number,



                    "state":

                        farmer.state,



                    "lga":

                        farmer.lga,



                    "status":

                        farmer.status,



                    "created_at": (

                        localtime(

                            farmer.created_at

                        ).isoformat()

                        if farmer.created_at

                        else None

                    ),

                }

            )



        # ========================================================

        # RECENT FARMS

        # ========================================================



        recent_farms = []



        for farm in farms_queryset[:10]:



            farmer = farm.farmer



            recent_farms.append(

                {

                    "id":

                        str(farm.id),



                    "farm_id":

                        farm.farm_id,



                    "farm_name":

                        farm.farm_name,



                    "farmer": (

                        f"{farmer.first_name} "

                        f"{farmer.last_name}"

                    ).strip()

                    if farmer

                    else "Unknown",



                    "farmer_id": (

                        farmer.farmer_id

                        if farmer

                        else None

                    ),



                    "farm_size":

                        float(farm.farm_size),



                    "primary_crop":

                        farm.primary_crop,



                    "state":

                        farm.state,



                    "lga":

                        farm.lga,



                    "status":

                        farm.status,



                    "latitude": (

                        float(farm.latitude)

                        if farm.latitude is not None

                        else None

                    ),



                    "longitude": (

                        float(farm.longitude)

                        if farm.longitude is not None

                        else None

                    ),



                    "created_at": (

                        localtime(

                            farm.created_at

                        ).isoformat()

                        if farm.created_at

                        else None

                    ),

                }

            )



        # ========================================================

        # RECENT SOIL TESTS

        # ========================================================



        recent_tests = []



        for test in tests_queryset[:10]:



            sample = test.sample



            farm = (

                sample.farm

                if sample

                else None

            )



            farmer = (

                farm.farmer

                if farm

                else None

            )



            recent_tests.append(

                {

                    "id":

                        str(test.id),



                    "test_id":

                        str(test.test_id),



                    "sample_id": (

                        sample.sample_id

                        if sample

                        else None

                    ),



                    "farm_name": (

                        farm.farm_name

                        if farm

                        else "Unknown"

                    ),



                    "farmer": (

                        f"{farmer.first_name} "

                        f"{farmer.last_name}"

                    ).strip()

                    if farmer

                    else "Unknown",



                    "status":

                        test.status,



                    "created_at": (

                        localtime(

                            test.created_at

                        ).isoformat()

                        if test.created_at

                        else None

                    ),



                    "tested_at": (

                        localtime(

                            test.tested_at

                        ).isoformat()

                        if test.tested_at

                        else None

                    ),

                }

            )



        # ========================================================

        # RESPONSE

        # ========================================================



        return Response(

            {

                "agent": {

                    "id":

                        str(agent.id),



                    "name": (

                        f"{agent.first_name} "

                        f"{agent.last_name}"

                    ).strip(),



                    "email":

                        agent.email,



                    "phone_number":

                        agent.phone_number,



                    "role":

                        agent.role,



                    "is_active":

                        agent.is_active,



                    "email_verified":

                        agent.email_verified,



                    "phone_verified":

                        agent.phone_verified,



                    "date_joined": (

                        localtime(

                            agent.date_joined

                        ).isoformat()

                        if agent.date_joined

                        else None

                    ),

                },



                "statistics": {

                    "farmers":

                        farmers_count,



                    "farms":

                        farms_count,



                    "farm_area":

                        round(

                            float(farm_area),

                            2,

                        ),



                    "samples":

                        samples_count,



                    "tests":

                        tests_count,



                    "completed_tests":

                        completed_tests,



                    "pending_tests":

                        pending_tests,



                    "failed_tests":

                        failed_tests,



                    "assessments":

                        assessments_count,



                    "activity_score":

                        activity_score,

                },



                "recent_farmers":

                    recent_farmers,



                "recent_farms":

                    recent_farms,



                "recent_tests":

                    recent_tests,

            }

        )