import unittest
from unittest.mock import patch, Mock
from nhl_shot_chart import convertToLocalDateTimeString, load_live_data_for_game, printJSON

class TestNHLShotCharts(unittest.TestCase):

    def test_convert_to_local_date_time_string(self):
        # Sample test case to convert UTC to PST
        result = convertToLocalDateTimeString('2022-09-27T02:00:00Z', 'US/Pacific')
        self.assertEqual(result, '2022-09-26 07:00 PM PDT')

        # Add more tests for different timezones and dates...

    def test_convert_to_local_date_time_string_exception_invalid_timezone(self):
        # Sample test case to convert UTC to PST
        result = convertToLocalDateTimeString('2022-09-27T02:00:00Z', 'invalid_timezone')
        self.assertEqual(result, None)

        # Add more tests for different timezones and dates...

    @patch('nhl_shot_chart.requests.get')
    def test_load_live_data_for_game(self, mock_get):
        # Mocking the external request
        mock_response = Mock()
        mock_response.json.return_value = {"gameId": "12345"}
        mock_get.return_value = mock_response

        result = load_live_data_for_game("12345")
        self.assertEqual(result, {"gameId": "12345"})

    @patch('builtins.print')
    def test_print_json(self, mock_print):
        data = '{"key": "value"}'
        expected_output = '\n\n*****\n\n"{\\"key\\": \\"value\\"}"\n\n*****\n\n'
        printJSON(data, 4)
        mock_print.assert_called_once_with(expected_output)

    @patch('builtins.print')
    def test_print_json_with_no_indentation(self, mock_print):
        data = '{"key": "value"}'
        expected_output = '\n\n*****\n\n{"key": "value"}\n\n*****\n\n'
        printJSON(data, 0)
        mock_print.assert_called_once_with(expected_output)