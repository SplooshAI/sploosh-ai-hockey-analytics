import matplotlib.pyplot as plt
from qrcode_generator import (
    generate_base64_image
)

def test_generate_base64_image_with_matplotlib_figure():
    # Create a simple matplotlib figure
    fig, ax = plt.subplots()
    ax.plot([0, 1], [0, 1])

    # Pass the figure to generate_base64_image
    base64_str = generate_base64_image(fig)

    # Assert that the function returns a base64 string
    assert isinstance(base64_str, str)
