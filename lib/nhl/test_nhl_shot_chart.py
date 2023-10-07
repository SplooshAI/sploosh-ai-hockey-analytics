import unittest
from unittest.mock import patch, Mock
from nhl_shot_chart import convertToLocalDateTimeString, load_live_data_for_game, printJSON

class TestNHLShotCharts(unittest.TestCase):

    def test_convert_to_local_date_time_string(self):
        # Sample test case to convert UTC to PST
        result = convertToLocalDateTimeString('2022-09-27T02:00:00Z', 'US/Pacific')
        self.assertEqual(result, '2022-09-26 07:00 PM PDT')

        # Add more tests for different timezones and dates...

    @patch('nhl_shot_chart.requests.get')
    def test_load_live_data_for_game(self, mock_get):
        # Mocking the external request
        mock_response = Mock()
        mock_response.json.return_value = {"gameId": "12345"}
        mock_get.return_value = mock_response

        result = load_live_data_for_game("12345")
        self.assertEqual(result, {"gameId": "12345"})

    def test_print_json(self):
        # Capture the output of the function
        import io
        import sys
        backup = sys.stdout

        sys.stdout = io.StringIO()  
        printJSON('{"key": "value"}', 4)
        output = sys.stdout.getvalue()

        sys.stdout.close()  
        sys.stdout = backup

        self.assertEqual(output, '\n\n*****\n\n"{\\"key\\": \\"value\\"}"\n\n*****\n\n\n')

if __name__ == '__main__':
    unittest.main()
