import 'package:flutter_test/flutter_test.dart';
import 'package:crowd_gps/main.dart';

void main() {
  testWidgets('App launches', (WidgetTester tester) async {
    await tester.pumpWidget(const CrowdGPSApp());
    expect(find.text('LocalPulse'), findsOneWidget);
  });
}
