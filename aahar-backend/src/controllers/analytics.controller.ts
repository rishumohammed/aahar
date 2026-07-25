import prisma from "../lib/prisma.js";
import { ok, serverError } from "../utils/response.js";

// GET /api/admin/dashboard
export const getAdminStats = async (req: any, res: any) => {
  try {
    const [
      totalUsers,
      totalCertified,
      pendingApps,
      totalEnquiries,
      monthlyRevenue,
      totalRestaurants,
      totalHotels
    ] = await Promise.all([
      prisma.user.count(),
      prisma.certification.count({ where: { status: "active" } }),
      prisma.application.count({ where: { status: "submitted" } }),
      prisma.businessLead.count(),
      prisma.payment.aggregate({
        where: { status: "captured" },
        _sum: { amount: true }
      }),
      prisma.restaurant.count(),
      prisma.hotel.count()
    ]);

    // Monthly trends (simplified)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentActivity = await prisma.notification.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, role: true } } }
    });

    return ok(res, {
      stats: {
        totalUsers,
        totalCertified,
        pendingApps,
        totalEnquiries,
        totalRestaurants,
        totalHotels,
        totalRevenue: monthlyRevenue._sum.amount || 0
      },
      recentActivity
    });
  } catch (e) { return serverError(res, e); }
};

// GET /api/owner/stats
export const getOwnerStats = async (req: any, res: any) => {
  try {
    const ownerId = req.user.id;
    
    const [restaurant, hotel] = await Promise.all([
      prisma.restaurant.findFirst({ where: { ownerId }, select: { id: true, name: true } }),
      prisma.hotel.findFirst({ where: { managerId: ownerId }, select: { id: true, name: true } })
    ]);

    const enquiries = await prisma.enquiry.count({
      where: {
        OR: [
          ...(hotel?.id ? [{ hotelId: hotel.id }] : []),
          ...(restaurant?.id ? [{ hotel: { linkedRestaurantId: restaurant.id } }] : [])
        ]
      }
    });

    const activeCert = await prisma.certification.findFirst({
      where: {
        OR: [
          ...(restaurant?.id ? [{ restaurantId: restaurant.id }] : []),
          ...(hotel?.id ? [{ hotelId: hotel.id }] : [])
        ],
        status: "active"
      }
    });

    // Fetch latest application and its audit
    const latestApp = await prisma.application.findFirst({
      where: {
        OR: [
          ...(restaurant?.id ? [{ restaurantId: restaurant.id }] : []),
          ...(hotel?.id ? [{ hotelId: hotel.id }] : [])
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        audit: true,
        certification: true
      }
    });

    // Fetch latest audit checklist to compute scores & corrective actions
    const latestAudit = latestApp ? await prisma.audit.findFirst({
      where: {
        applicationId: latestApp.id
      },
      orderBy: { createdAt: "desc" }
    }) : null;

    // Compute hygiene scores breakdown
    let hygieneScore = {
      overall: 0.0,
      kitchen: 0.0,
      foodStorage: 0.0,
      staffStandards: 0.0,
      documentation: 0.0,
      housekeeping: 0.0,
      roomSafety: 0.0,
      guestFacilities: 0.0,
      accessibility: 0.0,
      guestExperience: 0.0
    };

    const correctiveActions: any[] = [];

    if (latestAudit && latestAudit.checklist) {
      const checklist = latestAudit.checklist as any[];
      hygieneScore.overall = latestAudit.totalScore || 0;

      const calculateSectionScore = (sectionName: string) => {
        const items = checklist.filter(
          item => item.section.toLowerCase() === sectionName.toLowerCase() && item.score !== undefined
        );
        if (items.length === 0) return 0;
        const weightedSum = items.reduce((acc, item) => acc + (item.score * item.weight), 0);
        const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
        return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;
      };

      // FNB
      hygieneScore.kitchen = calculateSectionScore("Kitchen Hygiene");
      hygieneScore.foodStorage = calculateSectionScore("Food Storage");
      hygieneScore.staffStandards = calculateSectionScore("Staff Standards");
      hygieneScore.documentation = calculateSectionScore("Documentation");

      // Accommodation
      hygieneScore.housekeeping = calculateSectionScore("Housekeeping");
      hygieneScore.roomSafety = calculateSectionScore("Room Safety");
      hygieneScore.guestFacilities = calculateSectionScore("Guest Facilities");
      hygieneScore.accessibility = calculateSectionScore("Accessibility");
      hygieneScore.guestExperience = calculateSectionScore("Guest Experience");

      // Extract failed items (score < 4) for corrective actions
      const failedItems = checklist.filter(item => item.score !== undefined && item.score < 4);
      failedItems.forEach((item, index) => {
        correctiveActions.push({
          id: index + 1,
          text: `${item.section}: ${item.criterion}`,
          dueDate: new Date(latestAudit.completedAt ? latestAudit.completedAt.getTime() + 15 * 24 * 60 * 60 * 1000 : Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          priority: item.score <= 2 ? "high" : "medium",
          resolved: false
        });
      });
    }

    // Build timeline
    const timeline: any[] = [];
    if (latestApp) {
      timeline.push({
        date: latestApp.createdAt.toISOString(),
        event: "Application Created",
        done: true,
        icon: "📝"
      });

      const isSubmitted = ["submitted", "under_review", "gap_analysis", "audit_scheduled", "audit_complete", "approved", "certified"].includes(latestApp.status);
      timeline.push({
        date: latestApp.submittedAt ? latestApp.submittedAt.toISOString() : latestApp.createdAt.toISOString(),
        event: "Application Submitted",
        done: isSubmitted,
        icon: "📩"
      });

      const isUnderReview = ["under_review", "gap_analysis", "audit_scheduled", "audit_complete", "approved", "certified"].includes(latestApp.status);
      timeline.push({
        date: latestApp.submittedAt ? new Date(latestApp.submittedAt.getTime() + 24 * 60 * 60 * 1000).toISOString() : latestApp.createdAt.toISOString(),
        event: "Document Review",
        done: isUnderReview,
        icon: "🔍"
      });

      const isScheduled = ["audit_scheduled", "audit_complete", "approved", "certified"].includes(latestApp.status);
      timeline.push({
        date: latestApp.audit?.scheduledAt ? latestApp.audit.scheduledAt.toISOString() : new Date().toISOString(),
        event: isScheduled ? "Audit Scheduled" : "Audit Scheduling",
        done: isScheduled,
        icon: "📅"
      });

      const isComplete = ["audit_complete", "approved", "certified"].includes(latestApp.status);
      timeline.push({
        date: latestApp.audit?.completedAt ? latestApp.audit.completedAt.toISOString() : new Date().toISOString(),
        event: isComplete ? "Audit Executed" : "Audit Execution",
        done: isComplete,
        icon: "✅"
      });
    }

    const certification = activeCert ? {
      expiresAt: activeCert.expiresAt.toISOString(),
      status: activeCert.status,
      pdfUrl: activeCert.pdfUrl
    } : null;

    return ok(res, {
      enquiries,
      isCertified: !!activeCert,
      certNumber: activeCert?.certNumber,
      expiryDate: activeCert?.expiresAt,
      restaurantId: restaurant?.id || null,
      hotelId: hotel?.id || null,
      restaurantName: restaurant?.name || null,
      hotelName: hotel?.name || null,
      correctiveActions,
      timeline,
      hygieneScore,
      certification,
      applicationId: latestApp?.id || null,
      auditId: latestAudit?.id || null
    });
  } catch (e) { return serverError(res, e); }
};
