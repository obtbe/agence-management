/**
 * Soba Bamako - Utility helpers and formatters
 */

export function formatFCFA(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 FCFA';
  // Standard space separator for thousands in French West Africa
  const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

export function formatDateFR(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatMonthYearFR(monthYearStr: string): string {
  // expects "2026-09" or similar
  if (!monthYearStr) return '';
  const parts = monthYearStr.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${months[monthIndex] || parts[1]} ${year}`;
  }
  return monthYearStr;
}

export function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

/**
 * Generate a WhatsApp deep link with encoded message
 */
export function buildWhatsAppLink(phoneNumber: string, message: string): string {
  // Sanitize phone number to keep digits only
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  // Mali numbers usually start with 223 or are 8 digits starting with 7, 8, 9, 6
  let finalPhone = cleanNumber;
  if (!finalPhone.startsWith('223') && finalPhone.length === 8) {
    finalPhone = `223${finalPhone}`;
  }
  return `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-formatted professional messages for Bamako agencies
 */
export function getLateRentWhatsAppMessage(params: {
  tenantName: string;
  propertyTitle: string;
  monthYear: string;
  amountFCFA: number;
  agencyName: string;
  orangeMoneyNumber?: string;
  waveNumber?: string;
}): string {
  const monthName = formatMonthYearFR(params.monthYear);
  const formattedAmount = formatFCFA(params.amountFCFA);
  
  return `Bonjour M./Mme ${params.tenantName},

Nous espérons que vous allez bien.

Sauf erreur ou omission de notre part, nous n'avons pas encore enregistré le règlement de votre loyer du mois de *${monthName}* pour votre logement (*${params.propertyTitle}*), d'un montant de *${formattedAmount}*.

Pour rappel, vous pouvez effectuer votre versement via :
• Orange Money : ${params.orangeMoneyNumber || '+223 76 12 00 00'}
• Wave : ${params.waveNumber || '+223 76 12 00 00'}
• À l'agence en espèces ou par virement bancaire.

Merci de nous faire parvenir la référence ou capture du transfert dès validation.

Bien cordialement,
La direction — *${params.agencyName}*`;
}

export function getRentReceiptWhatsAppMessage(params: {
  tenantName: string;
  propertyTitle: string;
  monthYear: string;
  amountFCFA: number;
  receiptNumber: string;
  agencyName: string;
}): string {
  return `Bonjour M./Mme ${params.tenantName},

Nous vous confirmons la bonne réception de votre paiement de loyer pour le mois de *${formatMonthYearFR(params.monthYear)}* concernant le bien :
📍 *${params.propertyTitle}*
💰 Montant : *${formatFCFA(params.amountFCFA)}*
📄 Réf Quittance : *${params.receiptNumber}*

Votre quittance de loyer officielle a été émise et est disponible à tout moment.

Merci pour votre ponctualité !

— *${params.agencyName}*`;
}

export function getLeaseExpiringWhatsAppMessage(params: {
  tenantName: string;
  propertyTitle: string;
  endDate: string;
  daysRemaining: number;
  agencyName: string;
}): string {
  return `Bonjour M./Mme ${params.tenantName},

Votre contrat de bail pour le logement (*${params.propertyTitle}*) arrive à échéance le *${formatDateFR(params.endDate)}* (dans environ ${params.daysRemaining} jours).

Nous souhaitons faire le point avec vous concernant le renouvellement de votre bail. Merci de nous contacter à l'agence afin de préparer les formalités requises.

Bien à vous,
— *${params.agencyName}*`;
}

export function getMaintenanceVisitWhatsAppMessage(params: {
  tenantName: string;
  propertyTitle: string;
  issueTitle: string;
  artisanName: string;
  artisanPhone: string;
  dateStr: string;
  agencyName: string;
}): string {
  return `Bonjour M./Mme ${params.tenantName},

Suite à votre signalement d'intervention (*${params.issueTitle}*) pour votre logement (*${params.propertyTitle}*), notre artisan mandaté interviendra prochainement.

Artisan : *${params.artisanName}* (${params.artisanPhone})
Date prévue : *${params.dateStr}*

Merci de bien vouloir vous rendre disponible ou faciliter l'accès.

Cordialement,
— *${params.agencyName}*`;
}

/**
 * Convert numbers to french words for formal rent receipts (simplified)
 */
export function numberToFrenchWords(amount: number): string {
  if (amount === 0) return 'Zéro';
  // Common amounts in Bamako rent
  const thousands = Math.floor(amount / 1000);
  const remainder = amount % 1000;
  
  let result = '';
  if (thousands > 0) {
    if (thousands === 1) {
      result += 'Mille';
    } else {
      result += `${thousands} Mille`;
    }
  }
  if (remainder > 0) {
    result += ` ${remainder}`;
  }
  return `${result} Francs CFA`.trim();
}
