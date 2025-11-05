/**
 * Alerts Tab Screen
 * Shows service alerts with filtering and detail views
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../../lib/hooks/useAlerts';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { Colors } from '../../constants/Colors';
import type { Alert } from '../../types/api';

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [filter, setFilter] = useState<'all' | Alert['severity']>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const { data: alerts, isLoading, isError, error } = useAlerts(true);

  // Filter alerts by severity
  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    if (filter === 'all') return alerts;
    return alerts.filter((alert) => alert.severity === filter);
  }, [alerts, filter]);

  // Count by severity
  const counts = useMemo(() => {
    if (!alerts) return { all: 0, critical: 0, warning: 0, info: 0 };
    return {
      all: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length,
    };
  }, [alerts]);

  const getSeverityIcon = useCallback((severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
    }
  }, []);

  const getSeverityColor = useCallback(
    (severity: Alert['severity']) => {
      switch (severity) {
        case 'critical':
          return colors.statusError;
        case 'warning':
          return colors.statusWarning;
        case 'info':
          return colors.statusInfo;
      }
    },
    [colors]
  );

  const formatTimestamp = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  // Detail view
  if (selectedAlert) {
    const iconName = getSeverityIcon(selectedAlert.severity);
    const severityColor = getSeverityColor(selectedAlert.severity);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => setSelectedAlert(null)}
            accessibilityRole="button"
            accessibilityLabel="Back to alerts"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]} allowFontScaling>
              Back
            </Text>
          </Pressable>
        </View>

        {/* Alert Detail */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.detailContent}>
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: severityColor }]}>
            <View style={styles.detailHeader}>
              <View style={[styles.severityIconLarge, { backgroundColor: severityColor + '20' }]}>
                <Ionicons name={iconName} size={32} color={severityColor} />
              </View>
              <View style={styles.detailHeaderText}>
                <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
                  <Text style={styles.severityBadgeText} allowFontScaling>
                    {selectedAlert.severity.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.detailTitle, { color: colors.text }]} allowFontScaling>
                  {selectedAlert.cause}
                </Text>
                <Text style={[styles.detailTime, { color: colors.textSecondary }]} allowFontScaling>
                  {formatTimestamp(selectedAlert.postedAt)}
                </Text>
              </View>
            </View>

            <Text style={[styles.detailDescription, { color: colors.text }]} allowFontScaling>
              {selectedAlert.description}
            </Text>

            <View style={styles.detailSection}>
              <Text style={[styles.detailSectionTitle, { color: colors.text }]} allowFontScaling>
                Effect
              </Text>
              <Text style={[styles.detailSectionText, { color: colors.textSecondary }]} allowFontScaling>
                {selectedAlert.effect}
              </Text>
            </View>

            {selectedAlert.affectedRoutes.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={[styles.detailSectionTitle, { color: colors.text }]} allowFontScaling>
                  Affected Routes
                </Text>
                <View style={styles.routesList}>
                  {selectedAlert.affectedRoutes.map((routeId, index) => (
                    <View key={index} style={[styles.routeChip, { backgroundColor: colors.background }]}>
                      <Text style={[styles.routeChipText, { color: colors.text }]} allowFontScaling>
                        Route {routeId}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // List view
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Service Alerts</Text>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <Pressable
            style={[styles.filterButton, filter === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('all')}
            accessibilityRole="button"
            accessibilityLabel={`Show all alerts (${counts.all})`}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: filter === 'all' ? colors.background : colors.text },
              ]}
              allowFontScaling
            >
              All ({counts.all})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'critical' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('critical')}
            accessibilityRole="button"
            accessibilityLabel={`Show critical alerts (${counts.critical})`}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: filter === 'critical' ? colors.background : colors.text },
              ]}
              allowFontScaling
            >
              Critical ({counts.critical})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'warning' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('warning')}
            accessibilityRole="button"
            accessibilityLabel={`Show warning alerts (${counts.warning})`}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: filter === 'warning' ? colors.background : colors.text },
              ]}
              allowFontScaling
            >
              Warning ({counts.warning})
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'info' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('info')}
            accessibilityRole="button"
            accessibilityLabel={`Show info alerts (${counts.info})`}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: filter === 'info' ? colors.background : colors.text },
              ]}
              allowFontScaling
            >
              Info ({counts.info})
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* Loading state */}
      {isLoading && (
        <ScrollView style={styles.scrollView}>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </ScrollView>
      )}

      {/* Error state */}
      {isError && (
        <EmptyState icon="⚠️" title="Unable to load alerts" subtitle={error?.message || 'Please try again later'} />
      )}

      {/* Alerts list */}
      {!isLoading && !isError && (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {filteredAlerts.length === 0 ? (
            <EmptyState
              icon="✅"
              title={filter === 'all' ? 'No active alerts' : `No ${filter} alerts`}
              subtitle="All systems operating normally"
            />
          ) : (
            filteredAlerts.map((alert) => {
              const iconName = getSeverityIcon(alert.severity);
              const severityColor = getSeverityColor(alert.severity);

              return (
                <Pressable
                  key={alert.id}
                  style={[styles.alertCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setSelectedAlert(alert)}
                  accessibilityRole="button"
                  accessibilityLabel={`Alert: ${alert.cause}`}
                  android_ripple={{ color: colors.primary + '20' }}
                >
                  <View style={styles.alertContent}>
                    <View style={[styles.severityIcon, { backgroundColor: severityColor + '20' }]}>
                      <Ionicons name={iconName} size={24} color={severityColor} />
                    </View>
                    <View style={styles.alertText}>
                      <View style={styles.alertHeader}>
                        <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={2} allowFontScaling>
                          {alert.cause}
                        </Text>
                      </View>
                      <Text
                        style={[styles.alertDescription, { color: colors.textSecondary }]}
                        numberOfLines={2}
                        allowFontScaling
                      >
                        {alert.description}
                      </Text>
                      <View style={styles.alertFooter}>
                        <View style={[styles.severityChip, { backgroundColor: severityColor }]}>
                          <Text style={styles.severityChipText} allowFontScaling>
                            {alert.severity}
                          </Text>
                        </View>
                        <Text style={[styles.alertTime, { color: colors.textSecondary }]} allowFontScaling>
                          {formatTimestamp(alert.postedAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    fontSize: 17,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  alertContent: {
    flexDirection: 'row',
    gap: 12,
  },
  severityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
  },
  alertHeader: {
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  alertTime: {
    fontSize: 12,
  },
  detailContent: {
    padding: 16,
  },
  detailCard: {
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
  },
  detailHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  severityIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailHeaderText: {
    flex: 1,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  severityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailTime: {
    fontSize: 14,
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailSectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  routesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  routeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
