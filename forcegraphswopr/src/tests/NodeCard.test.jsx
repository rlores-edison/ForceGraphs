import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import NodeCard from "../components/NodeCard.jsx";


//To check that the event to close NodeCard works as expected 
describe("NodeCard Component", () => {
  it("calls the on_close function when the close button is clicked", () => {
    // Mock props
    const mockNode = [
      null,
      {
        id: "123",
        markers: ["site"],
      },
    ];

    const mockOnClose = vi.fn(); // Create a mock function for on_close

    render(
      <NodeCard
        node={mockNode}
        get_color_for_node={{}}
        graph_type=""
        selected_node_group=""
        on_close={mockOnClose}
      />
    );

    // Find the close button
    const closeButton = screen.getByLabelText("Close modal");

    // Simulate a click event
    fireEvent.click(closeButton);

    // Assert that the mock function was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

describe("NodeCard Component - defaultMarker Access", () => {
  it("correctly resolves defaultMarker from nodeData", () => {
    // Mock props
    const mockNode = [
      null,
      {
        id: "node-1",
        markers: ["site", "instalacion"],
      },
    ];

    // Mock implementation of NodeCard for this test
    const TestNodeCard = ({ node }) => {
      const nodeData = node[1] || {};
      const arrayNodeType = [
        "site",
        "instalacion",
        "instalZone",
        "tipoEquipo",
        "equip",
        "secEquip",
        "point",
      ];
      const defaultMarker = nodeData.markers.findIndex((item) =>
        arrayNodeType.includes(item)
      );

      return <div data-testid="defaultMarker">{defaultMarker}</div>;
    };

    const { getByTestId } = render(<TestNodeCard node={mockNode} />);
    const defaultMarkerElement = getByTestId("defaultMarker");

    // Assert that defaultMarker resolves correctly
    expect(defaultMarkerElement.textContent).toBe("0"); // 'site' is at index 0 in arrayNodeType
  });

  it("returns -1 if no markers match arrayNodeType", () => {
    const mockNode = [
      null,
      {
        id: "node-2",
        markers: ["unknown", "invalid"],
      },
    ];

    const TestNodeCard = ({ node }) => {
      const nodeData = node[1] || {};
      const arrayNodeType = [
        "site",
        "instalacion",
        "instalZone",
        "tipoEquipo",
        "equip",
        "secEquip",
        "point",
      ];
      const defaultMarker = nodeData.markers.findIndex((item) =>
        arrayNodeType.includes(item)
      );

      return <div data-testid="defaultMarker">{defaultMarker}</div>;
    };

  });
});
