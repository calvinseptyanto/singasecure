import { Network, ChevronDown, ChevronUp } from "lucide-react";

export default function Overview({ expanded, setExpanded }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          Threat Overview
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
        >
          {expanded ? "Collapse" : "Expand"}
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
      <p
        className={`text-gray-600 ${
          expanded ? "" : "line-clamp-3"
        } transition-all`}
      >
        Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti sit sed
        tempus vehicula massa dis ad. Eros ut egestas faucibus; nulla nunc
        iaculis. Vivamus adipiscing aptent ridiculus dignissim urna elit
        ullamcorper dis. Cubilia dolor blandit feugiat quis quam suscipit
        interdum praesent. Ex aliquet vel ridiculus malesuada metus condimentum
        netus. Dictum tincidunt turpis mattis non mollis neque finibus luctus
        mauris. Vel quisque libero eros vivamus ac habitant odio. Eu lectus
        vestibulum feugiat blandit cubilia litora nam aenean. Vestibulum
        consequat ornare ut iaculis; fermentum blandit. Elit leo elit elit,
        posuere aenean dapibus. Integer aliquet euismod turpis tristique morbi
        mollis malesuada faucibus tempus. Faucibus sapien imperdiet ligula
        conubia mi cras scelerisque porttitor maecenas. Mattis ex libero amet
        lorem elit risus non a. Sapien dapibus quis pellentesque turpis
        ridiculus suscipit. Cras curae fusce efficitur parturient laoreet vel;
        netus nostra vel. Euismod vestibulum eget non velit habitasse euismod;
        dignissim varius. Dolor sociosqu conubia dui fermentum velit at potenti
        egestas dolor? Faucibus ac at commodo per maecenas nec. Justo ornare
        maecenas vestibulum sapien maecenas a dignissim diam sem. Eu eget nullam
        odio cursus dui habitant. Dignissim mauris hac leo magna orci at
        tristique congue. Fusce cubilia felis integer libero bibendum vitae.
        Dictum cubilia nisl lectus viverra placerat potenti sapien. Ullamcorper
        rutrum venenatis nullam a parturient. Senectus nascetur varius ultricies
        maecenas lobortis viverra parturient curabitur. Metus ultrices in diam
        etiam a, phasellus consectetur vulputate. Conubia laoreet libero mi
        porta conubia dui malesuada consectetur. Orci habitasse justo vitae,
        enim efficitur laoreet. Duis per interdum massa varius iaculis hendrerit
        orci. Litora fusce primis pretium lorem lacus mi, cursus aenean.
        Vehicula fames finibus suspendisse porta nulla, sagittis rhoncus ac.
        Congue ultrices vehicula quis primis porttitor mi. Phasellus porttitor
        molestie habitant aliquet posuere tortor ad at. Netus mattis ultrices
        primis rhoncus etiam in netus duis mi. Vestibulum vel quisque rhoncus
        lectus leo; vehicula tristique. Vel bibendum ullamcorper praesent,
        euismod sagittis luctus parturient mattis. Pellentesque sodales ipsum
        malesuada accumsan consequat mattis. Euismod fusce primis pharetra
        vestibulum proin convallis. Nullam urna tempor nostra accumsan porta
        commodo euismod velit. Sed finibus nisi lacus per; metus tempor vitae
        consectetur.
      </p>
    </div>
  );
}
