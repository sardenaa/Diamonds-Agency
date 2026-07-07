export interface ReviewSubmissionData {
  bookingId: string;
  overallRating: number;
  driverRating: number;
  driverComment: string;
  guideRating: number;
  guideComment: string;
  generalComment: string;
  photoUri: string | null;
}

export class ReviewService {
  /**
   * Submits a premium travel/expedition review to the MAS dispatch API.
   * Handles packaging of components such as guide, chauffeur, and overall itinerary ratings.
   */
  static async submitReview(data: ReviewSubmissionData): Promise<{ success: boolean; updatedReview: any }> {
    const res = await fetch(`/api/bookings/${data.bookingId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        overallRating: data.overallRating,
        components: {
          chauffeur: {
            rating: data.driverRating,
            comment: data.driverComment
          },
          guide: {
            rating: data.guideRating,
            comment: data.guideComment
          },
          itinerary: {
            rating: data.overallRating,
            comment: data.generalComment
          }
        },
        generalComment: data.generalComment,
        photoUri: data.photoUri
      })
    });

    if (!res.ok) {
      throw new Error(`Review submission failed with status code ${res.status}`);
    }

    // Build immediate representation for local instant rendering updates
    const updatedReview = {
      submittedAt: new Date().toISOString(),
      overallRating: data.overallRating,
      components: {
        chauffeur: { rating: data.driverRating, comment: data.driverComment },
        guide: { rating: data.guideRating, comment: data.guideComment },
        itinerary: { rating: data.overallRating, comment: data.generalComment }
      },
      generalComment: data.generalComment
    };

    return {
      success: true,
      updatedReview
    };
  }
}
